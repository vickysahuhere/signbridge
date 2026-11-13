import test from 'node:test';
import assert from 'node:assert';
import {
  downsampleTo16k,
  floatTo16BitPCM,
  bufferToBase64,
  GeminiLiveSession,
  LiveAudioQueuePlayer
} from '../src/utils/geminiLiveService.js';

test('geminiLiveService - downsampleTo16k correctly resamples Float32 buffers', () => {
  // If sample rate matches target 16k, return original buffer directly
  const orig48k = new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
  const downsampled = downsampleTo16k(orig48k, 48000, 16000);
  assert.strictEqual(downsampled.length, 2);

  const sameRate = new Float32Array([0.1, 0.2, 0.3]);
  const unchanged = downsampleTo16k(sameRate, 16000, 16000);
  assert.strictEqual(unchanged, sameRate);

  // Safe with empty buffer
  const empty = downsampleTo16k(new Float32Array([]), 48000, 16000);
  assert.strictEqual(empty.length, 0);
});

test('geminiLiveService - floatTo16BitPCM converts Float32 [-1, 1] to signed 16-bit Little-Endian PCM', () => {
  const floats = new Float32Array([0.0, 1.0, -1.0, 0.5]);
  const pcmBuffer = floatTo16BitPCM(floats);

  assert.strictEqual(pcmBuffer.byteLength, 8); // 4 samples * 2 bytes = 8 bytes
  const view = new DataView(pcmBuffer);

  assert.strictEqual(view.getInt16(0, true), 0);
  assert.strictEqual(view.getInt16(2, true), 32767); // 0x7FFF
  assert.strictEqual(view.getInt16(4, true), -32768); // -0x8000
  assert.ok(Math.abs(view.getInt16(6, true) - 16383) <= 1);
});

test('geminiLiveService - bufferToBase64 safely encodes array buffers', () => {
  const floats = new Float32Array([0.0, 0.5]);
  const pcm = floatTo16BitPCM(floats);
  const base64 = bufferToBase64(pcm);

  assert.ok(typeof base64 === 'string');
  assert.ok(base64.length > 0);
});

test('geminiLiveService - GeminiLiveSession instantiates with correct defaults and requires API key', async () => {
  const session = new GeminiLiveSession({
    apiKey: 'AIzaSyTestKey123',
    voiceName: 'Puck',
    systemInstruction: 'You are Sanket AI.'
  });

  assert.strictEqual(session.apiKey, 'AIzaSyTestKey123');
  assert.strictEqual(session.voiceName, 'Puck');
  assert.strictEqual(session.model, 'models/gemini-3.8-live');
  assert.strictEqual(session.isSetupComplete, false);

  // sendScreenFrame should safely return false when socket is not open
  const frameResult = session.sendScreenFrame('data:image/jpeg;base64,1234');
  assert.strictEqual(frameResult, false);

  // sendTextMessage should safely return false when socket is not open
  const textResult = session.sendTextMessage('Hello');
  assert.strictEqual(textResult, false);

  // Stop should safely tear down without errors
  assert.doesNotThrow(() => {
    session.stop();
  });
});

test('geminiLiveService - LiveAudioQueuePlayer handles lifecycle gracefully', () => {
  const player = new LiveAudioQueuePlayer();
  assert.strictEqual(player.isPlaying, false);

  // Stop and close in node environment should not throw
  assert.doesNotThrow(() => {
    player.stop();
    player.close();
  });
});
