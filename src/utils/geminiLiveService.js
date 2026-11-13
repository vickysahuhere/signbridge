/**
 * geminiLiveService.js
 * 
 * 100% Client-Side Real-Time Bidirectional Voice & Multimodal Session with Gemini Live API.
 * 
 * PROTOCOL SPECIFICATION (v1beta — current as of 2025):
 * - WebSocket URL:
 *   wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=API_KEY
 * - Model: models/gemini-3.8-live  (primary), models/gemini-2.0-flash-live-001 (fallback)
 * - Audio Input:  raw 16-bit PCM, 16kHz, mono, little-endian  → realtimeInput.audio.{data,mimeType}
 * - Audio Output: 24kHz PCM streamed from server → played via LiveAudioQueuePlayer
 * - Text Input:   realtimeInput.text
 * - Visual Input: realtimeInput.video.{data,mimeType} for JPEG frames
 * - Setup payload: setup.responseModalities (top-level), setup.speechConfig inside setup
 * - Zero Backend Server: connects directly from the user's browser.
 */

// Helper to downsample Float32Array to 16000 Hz if needed
export function downsampleTo16k(buffer, sampleRate, targetRate = 16000) {
  if (sampleRate === targetRate || !buffer || buffer.length === 0) {
    return buffer;
  }
  const sampleRateRatio = sampleRate / targetRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

// Helper to convert Float32 [-1.0, 1.0] to 16-bit linear PCM little-endian
export function floatTo16BitPCM(float32Array) {
  if (!float32Array) return new ArrayBuffer(0);
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

// Convert ArrayBuffer or Uint8Array to Base64 safely in all browser environments
export function bufferToBase64(buffer) {
  if (!buffer) return '';
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(binary, 'binary').toString('base64');
  }
  return '';
}

/**
 * High-performance 24kHz Web Audio player for streaming incoming PCM chunks.
 */
export class LiveAudioQueuePlayer {
  constructor() {
    this.audioContext = null;
    this.nextPlayTime = 0;
    this.activeSources = new Set();
    this.isPlaying = false;
    this.onPlayStateChange = null;
  }

  init() {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContextClass({ sampleRate: 24000 });
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    this.nextPlayTime = Math.max(this.nextPlayTime, this.audioContext.currentTime);
  }

  playChunk(base64Pcm) {
    if (!base64Pcm) return;
    this.init();
    if (!this.audioContext) return;

    try {
      const binary = typeof atob !== 'undefined' ? atob(base64Pcm) : Buffer.from(base64Pcm, 'base64').toString('binary');
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const numSamples = Math.floor(bytes.byteLength / 2);
      if (numSamples === 0) return;

      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const floatSamples = new Float32Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        const int16 = view.getInt16(i * 2, true); // little-endian
        floatSamples[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7FFF;
      }

      const audioBuffer = this.audioContext.createBuffer(1, floatSamples.length, 24000);
      audioBuffer.getChannelData(0).set(floatSamples);

      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;
      if (this.nextPlayTime < now) {
        this.nextPlayTime = now;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
      this.activeSources.add(source);

      if (!this.isPlaying) {
        this.isPlaying = true;
        if (this.onPlayStateChange) this.onPlayStateChange(true);
      }

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          this.isPlaying = false;
          if (this.onPlayStateChange) this.onPlayStateChange(false);
        }
      };
    } catch (err) {
      console.warn('[LiveAudioQueuePlayer] Error playing audio chunk:', err);
    }
  }

  stop() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch (e) {}
    }
    this.activeSources.clear();
    this.isPlaying = false;
    if (this.audioContext) {
      this.nextPlayTime = this.audioContext.currentTime;
    }
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  close() {
    this.stop();
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }
}

/**
 * GeminiLiveSession manages the bidirectional WebSocket session with Google Gemini Live API.
 * Uses the v1beta endpoint and current protocol (2025).
 */
export class GeminiLiveSession {
  /**
   * @param {Object} options
   * @param {string} options.apiKey - Google Gemini API key
   * @param {string} [options.model] - Model name without 'models/' prefix, e.g. 'gemini-3.8-live'
   * @param {string} [options.voiceName] - Prebuilt voice name ('Puck', 'Aoede', 'Charon', 'Kore', 'Fenrir')
   * @param {string} [options.systemInstruction] - Grounded page context and instructions
   * @param {Function} [options.onConnected] - Callback on connection & setup complete
   * @param {Function} [options.onAudioChunk] - Callback when server outputs audio chunk
   * @param {Function} [options.onTextPart] - Callback when server outputs text chunk
   * @param {Function} [options.onTranscript] - Callback for user or model transcript
   * @param {Function} [options.onTurnComplete] - Callback when model turn completes
   * @param {Function} [options.onInterrupted] - Callback when user interrupted model
   * @param {Function} [options.onError] - Callback on error
   * @param {Function} [options.onClose] - Callback when session closes
   * @param {Function} [options.onUserSpeechEnergy] - Callback with mic volume energy
   */
  constructor(options = {}) {
    this.apiKey = options.apiKey?.trim();
    // Accept model with or without 'models/' prefix
    const rawModel = options.model || 'gemini-3.8-live';
    this.model = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`;
    this.voiceName = options.voiceName || 'Puck';
    this.systemInstruction = options.systemInstruction || 'You are Sanket AI, a friendly, concise voice guide for Indian Sign Language.';

    this.onConnected = options.onConnected || null;
    this.onAudioChunk = options.onAudioChunk || null;
    this.onTextPart = options.onTextPart || null;
    this.onTranscript = options.onTranscript || null;
    this.onTurnComplete = options.onTurnComplete || null;
    this.onInterrupted = options.onInterrupted || null;
    this.onError = options.onError || null;
    this.onClose = options.onClose || null;
    this.onUserSpeechEnergy = options.onUserSpeechEnergy || null;

    this.ws = null;
    this.isSetupComplete = false;
    this.player = new LiveAudioQueuePlayer();

    // Microphone audio capture
    this.mediaStream = null;
    this.audioInputContext = null;
    this.scriptProcessor = null;
    this.isRecording = false;

    this.activeAiTranscript = '';
    this.activeUserTranscript = '';
  }

  /**
   * Connects to the Gemini Live WebSocket endpoint (v1beta).
   */
  async start() {
    if (!this.apiKey) {
      throw new Error('API key is required for Gemini Live session.');
    }

    // v1beta endpoint — the current production path as of 2025
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${encodeURIComponent(this.apiKey)}`;

    try {
      this.player.init();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this._sendSetup();
      };

      this.ws.onmessage = async (event) => {
        let textData = '';
        if (typeof event.data === 'string') {
          textData = event.data;
        } else if (event.data instanceof Blob) {
          textData = await event.data.text();
        } else if (event.data instanceof ArrayBuffer) {
          const decoder = new TextDecoder();
          textData = decoder.decode(event.data);
        }

        try {
          const message = JSON.parse(textData);
          this._handleServerMessage(message);
        } catch (parseErr) {
          console.warn('[GeminiLiveSession] Non-JSON or parse error:', parseErr);
        }
      };

      this.ws.onerror = (err) => {
        console.error('[GeminiLiveSession] WebSocket error:', err);
        if (this.onError) this.onError(err);
      };

      this.ws.onclose = (event) => {
        this.stop();
        if (this.onClose) this.onClose(event);
      };

      // Start local microphone capture concurrently
      await this._startMicCapture();
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  /**
   * Sends the mandatory setup payload to configure model, voice and system context.
   * Uses the v1beta setup format: responseModalities at top-level of setup.
   */
  _sendSetup() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const setupPayload = {
      setup: {
        model: this.model,
        // responseModalities is top-level in setup (v1beta format)
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: this.voiceName
            }
          }
        },
        systemInstruction: {
          parts: [
            {
              text: `${this.systemInstruction}\n\nIMPORTANT: You are communicating via live continuous voice. Keep spoken responses friendly, conversational, and direct (1-3 spoken sentences). Do not use markdown symbols like asterisks or hashtags since your words are spoken aloud.`
            }
          ]
        }
      }
    };

    this.ws.send(JSON.stringify(setupPayload));
  }

  /**
   * Dispatches incoming server message events.
   */
  _handleServerMessage(msg) {
    // 1. Setup Complete
    if (msg.setupComplete) {
      this.isSetupComplete = true;
      if (this.onConnected) this.onConnected();
      return;
    }

    // 2. Server Content
    if (msg.serverContent) {
      const { modelTurn, turnComplete, interrupted, inputTranscription, outputTranscription } = msg.serverContent;

      // User barge-in: cancel ongoing audio playback immediately
      if (interrupted) {
        this.player.stop();
        if (this.onInterrupted) this.onInterrupted();
      }

      // Input transcript of user's voice
      if (inputTranscription?.text) {
        this.activeUserTranscript += inputTranscription.text;
        if (this.onTranscript) {
          this.onTranscript({ role: 'user', text: this.activeUserTranscript, isInterim: false });
        }
      }

      // Output transcript of Gemini's response
      if (outputTranscription?.text) {
        this.activeAiTranscript += outputTranscription.text;
        if (this.onTranscript) {
          this.onTranscript({ role: 'assistant', text: this.activeAiTranscript, isInterim: false });
        }
      }

      // Streamed model turn (audio chunks and text)
      if (modelTurn?.parts) {
        for (const part of modelTurn.parts) {
          if (part.inlineData && part.inlineData.data) {
            const audioData = part.inlineData.data;
            this.player.playChunk(audioData);
            if (this.onAudioChunk) this.onAudioChunk(audioData);
          }
          if (part.text) {
            this.activeAiTranscript += part.text;
            if (this.onTextPart) this.onTextPart(part.text);
          }
        }
      }

      // Model finished responding to the current utterance
      if (turnComplete) {
        const fullAiText = this.activeAiTranscript;
        const fullUserText = this.activeUserTranscript;
        this.activeAiTranscript = '';
        this.activeUserTranscript = '';
        if (this.onTurnComplete) {
          this.onTurnComplete({ replyText: fullAiText, userText: fullUserText });
        }
      }
    }
  }

  /**
   * Starts local microphone streaming at 16kHz PCM.
   * Uses realtimeInput.audio format (v1beta).
   */
  async _startMicCapture() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.warn('[GeminiLiveSession] getUserMedia not supported in this environment.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    this.mediaStream = stream;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioInputContext = new AudioContextClass();

    const source = this.audioInputContext.createMediaStreamSource(stream);
    // 4096 buffer size at 16-48kHz yields ~85-250ms chunks, ideal for streaming latency
    this.scriptProcessor = this.audioInputContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const inputChannel = e.inputBuffer.getChannelData(0);

      // Measure volume energy for UI feedback
      let sum = 0;
      for (let i = 0; i < inputChannel.length; i++) {
        sum += inputChannel[i] * inputChannel[i];
      }
      const rms = Math.sqrt(sum / inputChannel.length);
      if (this.onUserSpeechEnergy) {
        this.onUserSpeechEnergy(rms);
      }

      // If server setup complete and socket open, stream PCM chunk
      if (this.isSetupComplete && this.ws && this.ws.readyState === WebSocket.OPEN) {
        const downsampled = downsampleTo16k(inputChannel, this.audioInputContext.sampleRate, 16000);
        const pcm16 = floatTo16BitPCM(downsampled);
        const base64 = bufferToBase64(pcm16);

        if (base64) {
          // v1beta format: realtimeInput.audio.{data, mimeType}
          const chunkMsg = {
            realtimeInput: {
              audio: {
                data: base64,
                mimeType: 'audio/pcm;rate=16000'
              }
            }
          };
          try {
            this.ws.send(JSON.stringify(chunkMsg));
          } catch (sendErr) {
            console.warn('[GeminiLiveSession] Error sending audio chunk:', sendErr);
          }
        }
      }
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioInputContext.destination);
    this.isRecording = true;
  }

  /**
   * Sends a visual screen or camera frame (JPEG format) to the live session.
   * Uses realtimeInput.video format (v1beta).
   * @param {string} jpegBase64 - Raw base64 or data URL of the JPEG screenshot
   */
  sendScreenFrame(jpegBase64) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isSetupComplete) {
      return false;
    }
    const cleanBase64 = (jpegBase64 || '').replace(/^data:image\/\w+;base64,/, '').trim();
    if (!cleanBase64) return false;

    // v1beta format: realtimeInput.video.{data, mimeType}
    const frameMsg = {
      realtimeInput: {
        video: {
          data: cleanBase64,
          mimeType: 'image/jpeg'
        }
      }
    };

    try {
      this.ws.send(JSON.stringify(frameMsg));
      return true;
    } catch (err) {
      console.warn('[GeminiLiveSession] Error sending screen frame:', err);
      return false;
    }
  }

  /**
   * Injects a text message or question into the live session.
   * Uses realtimeInput.text (v1beta).
   * @param {string} text - User prompt text
   */
  sendTextMessage(text) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !text?.trim()) {
      return false;
    }

    // v1beta format: realtimeInput.text
    const contentMsg = {
      realtimeInput: {
        text: text.trim()
      }
    };

    try {
      this.ws.send(JSON.stringify(contentMsg));
      return true;
    } catch (err) {
      console.warn('[GeminiLiveSession] Error sending text message:', err);
      return false;
    }
  }

  /**
   * Stops recording, closes WebSocket, and releases audio resources.
   */
  stop() {
    this.isRecording = false;

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      this.mediaStream = null;
    }

    if (this.audioInputContext) {
      try {
        this.audioInputContext.close();
      } catch (e) {}
      this.audioInputContext = null;
    }

    if (this.player) {
      this.player.stop();
    }

    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close();
        }
      } catch (e) {}
      this.ws = null;
    }

    this.isSetupComplete = false;
  }
}
