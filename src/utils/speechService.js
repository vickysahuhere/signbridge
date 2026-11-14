/**
 * speechService.js
 * 
 * 100% In-Browser Voice Engine for Sanket AI.
 * 
 * Invariants & Capabilities:
 * 1. Zero Cloud Backend — Uses native browser Web Speech API (SpeechRecognition & SpeechSynthesis).
 * 2. Natural TTS Cleanup — Strips markdown formatting (headers, backticks, asterisks, links) before vocalization.
 * 3. Robust Continuous STT — Keeps microphone active, streams live speech transcripts, and auto-commits on silence.
 * 4. Privacy Preserving — Voice processing stays strictly inside the client's device.
 */

/**
 * Checks if Speech Recognition (Speech-to-Text) is supported in current browser.
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Checks if Speech Synthesis (Text-to-Speech) is supported in current browser.
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Strips markdown and special tokens from text to produce clean, natural spoken speech.
 * 
 * @param {string} text - Raw markdown message from assistant
 * @returns {string} Clean prose text for speech synthesizer
 */
export function cleanTextForSpeech(text = '') {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [Label](url) -> Label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold and italic asterisks/underscores
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove markdown headings (# H1, ## H2, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Remove unordered list markers (*, -, +)
    .replace(/^[\*\-\+]\s+/gm, '')
    // Remove numbered list markers (1. , 2. )
    .replace(/^\d+\.\s+/gm, '')
    // Replace multiple newlines or spaces with single space
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

  // If text doesn't end with punctuation, append period for natural cadence
  if (cleaned && !/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Robust continuous Speech-to-Text recognizer with silence detection.
 */
export class VoiceRecognizer {
  constructor({
    onResult,
    onSpeechEnd,
    onError,
    onStart,
    onEnd,
    autoCommitMs = 1100,
    lang = ''
  } = {}) {
    this.onResult = onResult;
    this.onSpeechEnd = onSpeechEnd;
    this.onError = onError;
    this.onStart = onStart;
    this.onEnd = onEnd;
    this.autoCommitMs = autoCommitMs;
    this.lang = lang || (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
    this.recognition = null;
    this.isListening = false;
    this.shouldStayActive = false;
    this.isCommitting = false;
    this.silenceTimer = null;
    this.latestTranscript = '';
  }

  _createInstance() {
    if (!isSpeechRecognitionSupported()) return null;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = this.lang;

      rec.onstart = () => {
        this.isListening = true;
        this.isCommitting = false;
        if (this.onStart) this.onStart();
      };

      rec.onresult = (event) => {
        let final = '';
        let interim = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }

        const currentTotal = (final + interim).trim();
        this.latestTranscript = currentTotal;

        if (this.onResult) {
          this.onResult({
            transcript: currentTotal,
            isFinal: Boolean(final.trim())
          });
        }

        // Reset silence commit timer whenever new spoken words are recognized
        if (currentTotal) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.shouldStayActive && this.latestTranscript.trim() && !this.isCommitting) {
              const textToCommit = this.latestTranscript.trim();
              this.isCommitting = true;
              this.latestTranscript = '';
              try {
                this.recognition?.stop();
              } catch (e) {}
              if (this.onSpeechEnd) {
                this.onSpeechEnd(textToCommit);
              }
            }
          }, this.autoCommitMs);
        }
      };

      rec.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('[SpeechService] Recognition error:', event.error);
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.shouldStayActive = false;
        }
        if (this.onError) {
          this.onError(event.error);
        }
      };

      rec.onend = () => {
        this.isListening = false;
        clearTimeout(this.silenceTimer);

        // If continuous mode is on and we didn't just commit a query to the AI, auto-restart
        if (this.shouldStayActive && !this.isCommitting) {
          setTimeout(() => {
            if (this.shouldStayActive && !this.isListening && !this.isCommitting) {
              this.start();
            }
          }, 300);
        } else {
          if (this.onEnd) this.onEnd();
        }
      };

      return rec;
    } catch (err) {
      console.warn('[SpeechService] Failed to create SpeechRecognition:', err);
      return null;
    }
  }

  start() {
    if (!isSpeechRecognitionSupported()) {
      if (this.onError) this.onError('Speech recognition is not supported in this browser.');
      return false;
    }

    this.shouldStayActive = true;
    this.isCommitting = false;
    this.latestTranscript = '';
    clearTimeout(this.silenceTimer);

    try {
      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch (e) {}
      }

      this.recognition = this._createInstance();
      if (!this.recognition) return false;

      this.recognition.start();
      return true;
    } catch (err) {
      console.warn('[SpeechService] start() exception:', err);
      return false;
    }
  }

  stop() {
    this.shouldStayActive = false;
    this.isCommitting = false;
    clearTimeout(this.silenceTimer);
    if (!this.recognition) return;

    try {
      this.recognition.stop();
    } catch (err) {}
    this.isListening = false;
  }

  abort() {
    this.shouldStayActive = false;
    this.isCommitting = false;
    clearTimeout(this.silenceTimer);
    if (!this.recognition) return;

    try {
      this.recognition.abort();
    } catch (err) {}
    this.isListening = false;
  }
}

/**
 * Direct Microphone Recorder for Gemini Multimodal Audio Input.
 * Captures user speech directly as audio/webm and detects silence without browser STT.
 */
export class GeminiVoiceRecorder {
  constructor({
    onStart,
    onAudioReady,
    onVolume,
    onError,
    onEnd,
    silenceMs = 1200
  } = {}) {
    this.onStart = onStart;
    this.onAudioReady = onAudioReady;
    this.onVolume = onVolume;
    this.onError = onError;
    this.onEnd = onEnd;
    this.silenceMs = silenceMs;

    this.mediaRecorder = null;
    this.stream = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.analyser = null;
    this.silenceTimer = null;
    this.isRecording = false;
    this.hasSpoken = false;
    this.animFrame = null;
  }

  async start() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      if (this.onError) this.onError(new Error('Audio recording not supported in this browser.'));
      return false;
    }

    this.cleanup();
    this.audioChunks = [];
    this.hasSpoken = false;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
      this.isRecording = true;

      // Voice Activity & Silence Detection using Web Audio API
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const checkVolume = () => {
          if (!this.isRecording || !this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          if (this.onVolume) this.onVolume(avg);

          // Audio threshold: speech detected when volume > 10
          if (avg > 10) {
            this.hasSpoken = true;
            clearTimeout(this.silenceTimer);
            this.silenceTimer = setTimeout(() => {
              if (this.isRecording && this.hasSpoken) {
                this.stop();
              }
            }, this.silenceMs);
          }

          this.animFrame = requestAnimationFrame(checkVolume);
        };
        this.animFrame = requestAnimationFrame(checkVolume);
      }

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.cleanup();
        if (this.onAudioReady && audioBlob.size > 100) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result ? String(reader.result).split(',')[1] : '';
            if (base64) {
              this.onAudioReady({ base64, mimeType: 'audio/webm', blob: audioBlob });
            } else if (this.onEnd) {
              this.onEnd();
            }
          };
          reader.readAsDataURL(audioBlob);
        } else {
          if (this.onEnd) this.onEnd();
        }
      };

      this.mediaRecorder.start(100);
      if (this.onStart) this.onStart();
      return true;
    } catch (err) {
      this.cleanup();
      if (this.onError) this.onError(err);
      return false;
    }
  }

  stop() {
    this.isRecording = false;
    clearTimeout(this.silenceTimer);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    } else {
      this.cleanup();
      if (this.onEnd) this.onEnd();
    }
  }

  abort() {
    this.hasSpoken = false;
    this.isRecording = false;
    clearTimeout(this.silenceTimer);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.cleanup();
  }

  cleanup() {
    this.isRecording = false;
    clearTimeout(this.silenceTimer);
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    if (this.audioContext) {
      try { this.audioContext.close(); } catch (e) {}
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
}

let currentPlayingAudio = null;

/**
 * Speaks text aloud using browser SpeechSynthesis with natural vocal settings.
 * 
 * @param {string} text - Text to speak
 * @param {Object} [options] - Configuration
 * @returns {SpeechSynthesisUtterance | null}
 */
export function speakText(text = '', { rate = 1.05, pitch = 1.0, lang = 'en-US', onStart, onEnd, onError } = {}) {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError(new Error('SpeechSynthesis not supported'));
    return null;
  }

  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return null;

  try {
    const utterance = new window.SpeechSynthesisUtterance(cleaned);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = lang;

    // Pick a natural voice that matches the requested language (e.g. hi-IN -> Hindi voice)
    const prefix = (lang || 'en').slice(0, 2).toLowerCase();
    const voices = window.speechSynthesis.getVoices?.() || [];
    const inLang = voices.filter(v => v.lang.toLowerCase().startsWith(prefix));
    const preferredVoice = inLang.find(v => v.lang.toLowerCase() === lang.toLowerCase() && /Google|Natural|Premium|Neural|Microsoft/.test(v.name))
      || inLang.find(v => /Google|Natural|Premium|Neural|Microsoft|Samantha/.test(v.name))
      || inLang[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    if (onError) utterance.onerror = onError;

    // In Chrome, if speechSynthesis was paused, resume it
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('[SpeechService] speakText error:', err);
    if (onError) onError(err);
    return null;
  }
}

/**
 * Plays native Gemini voice audio (base64) using Web Audio or HTML5 Audio.
 * 
 * @param {string} base64Data - Raw base64 audio data returned by Gemini API
 * @param {string} [mimeType='audio/wav'] - MIME type of the audio
 * @param {Object} [options] - Lifecycle callbacks { onStart, onEnd, onError }
 * @returns {Promise<{ stop: Function } | null>}
 */
export async function playGeminiAudio(base64Data, mimeType = 'audio/wav', { onStart, onEnd, onError } = {}) {
  stopSpeaking();
  if (!base64Data) {
    if (onError) onError(new Error('No audio data provided'));
    return null;
  }

  try {
    const binary = (typeof atob === 'function')
      ? atob(base64Data)
      : (typeof Buffer !== 'undefined' ? Buffer.from(base64Data, 'base64').toString('binary') : '');
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    // Check if running in browser
    if (typeof window === 'undefined') {
      if (onEnd) onEnd();
      return null;
    }

    // If raw PCM (16-bit little endian, mono, e.g. 24kHz)
    if (mimeType.toLowerCase().includes('pcm') || mimeType.toLowerCase().includes('l16')) {
      let sampleRate = 24000;
      const rateMatch = mimeType.match(/rate=(\d+)/i);
      if (rateMatch && rateMatch[1]) {
        sampleRate = parseInt(rateMatch[1], 10) || 24000;
      }
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio API not supported');

      const audioCtx = new AudioContextClass({ sampleRate });
      if (audioCtx.state === 'suspended') {
        try { await audioCtx.resume(); } catch (e) {}
      }

      const length = Math.floor(bytes.byteLength / 2);
      const float32Array = new Float32Array(length);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, length * 2);
      for (let i = 0; i < length; i++) {
        float32Array[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      let isFinished = false;
      const cleanup = () => {
        if (!isFinished) {
          isFinished = true;
          try { source.stop(); } catch (e) {}
          try { audioCtx.close(); } catch (e) {}
          if (currentPlayingAudio === playbackHandle) currentPlayingAudio = null;
        }
      };

      source.onended = () => {
        cleanup();
        if (onEnd) onEnd();
      };

      source.start(0);
      if (onStart) onStart();

      const playbackHandle = { stop: cleanup };
      currentPlayingAudio = playbackHandle;
      return playbackHandle;
    }

    // Standard audio container (WAV, MP3, OGG, WebM)
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    let isFinished = false;
    const cleanup = () => {
      if (!isFinished) {
        isFinished = true;
        try { audio.pause(); } catch (e) {}
        audio.currentTime = 0;
        URL.revokeObjectURL(url);
        if (currentPlayingAudio === playbackHandle) currentPlayingAudio = null;
      }
    };

    audio.onplay = () => { if (onStart) onStart(); };
    audio.onended = () => {
      cleanup();
      if (onEnd) onEnd();
    };
    audio.onerror = (err) => {
      cleanup();
      if (onError) onError(err);
    };

    const playbackHandle = { stop: cleanup };
    currentPlayingAudio = playbackHandle;

    await audio.play();
    return playbackHandle;
  } catch (err) {
    console.warn('[SpeechService] playGeminiAudio failed:', err);
    if (onError) onError(err);
    return null;
  }
}

/**
 * Immediately cancels any active audio playback (Gemini native voice or browser SpeechSynthesis).
 */
export function stopSpeaking() {
  if (currentPlayingAudio) {
    try {
      if (typeof currentPlayingAudio.stop === 'function') {
        currentPlayingAudio.stop();
      } else if (typeof currentPlayingAudio.pause === 'function') {
        currentPlayingAudio.pause();
        currentPlayingAudio.currentTime = 0;
      }
    } catch (e) {}
    currentPlayingAudio = null;
  }

  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('[SpeechService] stopSpeaking error:', err);
    }
  }
}

/**
 * Checks if the browser is currently vocalizing speech.
 */
export function isSpeaking() {
  if (!isSpeechSynthesisSupported()) return false;
  return Boolean(window.speechSynthesis.speaking);
}
