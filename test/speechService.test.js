import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanTextForSpeech,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  playGeminiAudio,
  stopSpeaking
} from '../src/utils/speechService.js';

test('speechService - cleanTextForSpeech strips markdown formatting for natural vocalization', () => {
  const markdown = `
### How to Sign **Namaste**
1. Press \`both flat palms\` together at chest level.
2. Check [Dictionary](https://sanket-isl.org) for details.
> Keep wrists close together!
\`\`\`js
console.log("ignore code");
\`\`\`
* Relax shoulders and smile!
`;

  const cleaned = cleanTextForSpeech(markdown);

  // Markdown syntax removed
  assert.equal(cleaned.includes('###'), false);
  assert.equal(cleaned.includes('**Namaste**'), false);
  assert.ok(cleaned.includes('Namaste'));
  assert.equal(cleaned.includes('`both flat palms`'), false);
  assert.ok(cleaned.includes('both flat palms'));
  assert.equal(cleaned.includes('[Dictionary]'), false);
  assert.ok(cleaned.includes('Dictionary'));
  assert.equal(cleaned.includes('https://sanket-isl.org'), false);
  assert.equal(cleaned.includes('```'), false);
  assert.equal(cleaned.includes('console.log'), false);
  assert.equal(cleaned.includes('>'), false);

  // Empty or invalid inputs
  assert.equal(cleanTextForSpeech(''), '');
  assert.equal(cleanTextForSpeech(null), '');
  assert.equal(cleanTextForSpeech(undefined), '');
});

test('speechService - environment feature checks return safe booleans in Node environment', () => {
  assert.equal(typeof isSpeechRecognitionSupported(), 'boolean');
  assert.equal(typeof isSpeechSynthesisSupported(), 'boolean');
});

test('speechService - playGeminiAudio and stopSpeaking handle empty and node environments safely', async () => {
  // Empty audio base64 handled gracefully
  let errorCaught = null;
  await playGeminiAudio('', 'audio/wav', { onError: (e) => { errorCaught = e; } });
  assert.ok(errorCaught instanceof Error);

  // Valid base64 in node environment does not crash and invokes onEnd
  let finished = false;
  const mockBase64 = Buffer.from('RIFF....WAVEfmt ').toString('base64');
  await playGeminiAudio(mockBase64, 'audio/wav', { onEnd: () => { finished = true; } });
  assert.equal(finished, true);

  // stopSpeaking is safe to call anytime
  assert.doesNotThrow(() => {
    stopSpeaking();
  });
});
