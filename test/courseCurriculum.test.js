import { test } from 'node:test';
import assert from 'node:assert';
import {
  ISL_COURSE_LEVELS,
  CORE_PATH_GLOSSES,
  getLevelForGloss,
  getNextRecommendedSign,
  calculateCourseProgress
} from '../src/ai/islCourseCurriculum.js';
import { ISL_LEARN_ITEMS, getLearnItemByLabel } from '../src/ai/islTargetLandmarks.js';

test('islCourseCurriculum - defines 7 structured progressive course levels', () => {
  assert.strictEqual(Array.isArray(ISL_COURSE_LEVELS), true);
  assert.strictEqual(ISL_COURSE_LEVELS.length, 7);

  // Level 1 must start with NAMASTE
  const level1 = ISL_COURSE_LEVELS[0];
  assert.strictEqual(level1.levelNumber, 1);
  assert.strictEqual(level1.startSign, 'NAMASTE');
  assert.strictEqual(level1.glosses[0], 'NAMASTE');
  assert.strictEqual(level1.glosses.includes('HELLO'), true);
  assert.strictEqual(level1.glosses.includes('GOOD_MORNING'), true);
  assert.strictEqual(level1.glosses.includes('GOOD_AFTERNOON'), true);
  assert.strictEqual(level1.glosses.includes('GOOD_EVENING'), true);
  assert.strictEqual(level1.glosses.includes('GOOD_NIGHT'), true);
  assert.strictEqual(level1.glosses.includes('THANK_YOU'), true);
  assert.strictEqual(level1.glosses.includes('PLEASE'), true);
  assert.strictEqual(level1.glosses.includes('SORRY'), true);

  // Level 2 must cover the 26 authentic two-handed alphabet letters
  const level2 = ISL_COURSE_LEVELS[1];
  assert.strictEqual(level2.levelNumber, 2);
  assert.strictEqual(level2.startSign, 'A');
  assert.strictEqual(level2.glosses.length, 26);
  assert.strictEqual(level2.glosses[0], 'A');
  assert.strictEqual(level2.glosses[25], 'Z');

  // Level 3 must cover Survival, Health and Emergency
  const level3 = ISL_COURSE_LEVELS[2];
  assert.strictEqual(level3.levelNumber, 3);
  assert.strictEqual(level3.glosses.includes('HELP'), true);
  assert.strictEqual(level3.glosses.includes('WATER'), true);
  assert.strictEqual(level3.glosses.includes('HOSPITAL'), true);

  // Level 4 must cover Family and WH-Questions
  const level4 = ISL_COURSE_LEVELS[3];
  assert.strictEqual(level4.levelNumber, 4);
  assert.strictEqual(level4.glosses.includes('WHAT'), true);
  assert.strictEqual(level4.glosses.includes('MOTHER'), true);

  // Level 5 must cover Transit and Civic India
  const level5 = ISL_COURSE_LEVELS[4];
  assert.strictEqual(level5.levelNumber, 5);
  assert.strictEqual(level5.glosses.includes('AUTO_RICKSHAW'), true);
  assert.strictEqual(level5.glosses.includes('METRO_TRAIN'), true);
  assert.strictEqual(level5.glosses.includes('AADHAAR_CARD'), true);

  // Level 6 covers Digital life, Workplace and Inclusion
  const level6 = ISL_COURSE_LEVELS[5];
  assert.strictEqual(level6.levelNumber, 6);
  assert.strictEqual(level6.glosses.includes('SIGN_LANGUAGE'), true);
  assert.strictEqual(level6.glosses.includes('INTERPRETER'), true);

  // Level 7 is the 1000+ Conversational Lexicon
  const level7 = ISL_COURSE_LEVELS[6];
  assert.strictEqual(level7.levelNumber, 7);
  assert.strictEqual(level7.isLexiconLevel, true);
});

test('islCourseCurriculum - getLevelForGloss maps signs to their respective levels', () => {
  assert.strictEqual(getLevelForGloss('NAMASTE').levelNumber, 1);
  assert.strictEqual(getLevelForGloss('hello').levelNumber, 1);
  assert.strictEqual(getLevelForGloss('A').levelNumber, 2);
  assert.strictEqual(getLevelForGloss('Z').levelNumber, 2);
  assert.strictEqual(getLevelForGloss('HELP').levelNumber, 3);
  assert.strictEqual(getLevelForGloss('WHAT').levelNumber, 4);
  assert.strictEqual(getLevelForGloss('AUTO_RICKSHAW').levelNumber, 5);
  assert.strictEqual(getLevelForGloss('SIGN_LANGUAGE').levelNumber, 6);
  // Unlisted words belong to Level 7 lexicon
  assert.strictEqual(getLevelForGloss('ROTI_BREAD').levelNumber, 7);
});

test('islCourseCurriculum - getNextRecommendedSign navigates sequentially along the curriculum path', () => {
  const emptyMastered = new Set();

  // Fresh user starts with NAMASTE
  assert.strictEqual(getNextRecommendedSign(null, emptyMastered, ISL_LEARN_ITEMS), 'NAMASTE');

  // When NAMASTE is mastered, advances to HELLO
  const masteredOne = new Set(['NAMASTE']);
  assert.strictEqual(getNextRecommendedSign('NAMASTE', masteredOne, ISL_LEARN_ITEMS), 'HELLO');

  // Regression test: When user has mastered courtesies through NO, advances to ME
  const masteredCourtesies = new Set([
    'NAMASTE', 'HELLO', 'GOOD_MORNING', 'GOOD_AFTERNOON', 'GOOD_EVENING', 'GOOD_NIGHT',
    'WELCOME', 'THANK_YOU', 'PLEASE', 'SORRY', 'YES', 'NO'
  ]);
  const nextSign = getNextRecommendedSign('HELLO', masteredCourtesies, ISL_LEARN_ITEMS);
  assert.strictEqual(nextSign, 'ME');

  // Verify all CORE_PATH_GLOSSES resolve to valid learn items
  const meItem = getLearnItemByLabel('ME');
  assert.ok(meItem != null, 'ME item must exist in ISL_LEARN_ITEMS');
  assert.notStrictEqual(meItem.id, 'hello', 'ME must not fall back to hello');
  assert.strictEqual(meItem.id, 'me');

  const goodItem = getLearnItemByLabel('GOOD');
  assert.ok(goodItem != null, 'GOOD item must exist in ISL_LEARN_ITEMS');
  assert.strictEqual(goodItem.id, 'good');

  const badItem = getLearnItemByLabel('BAD');
  assert.ok(badItem != null, 'BAD item must exist in ISL_LEARN_ITEMS');
  assert.strictEqual(badItem.id, 'bad');

  // When all Level 1 is mastered, advances to Level 2 (A)
  const level1Glosses = ISL_COURSE_LEVELS[0].glosses;
  const masteredLevel1 = new Set(level1Glosses);
  assert.strictEqual(getNextRecommendedSign('BAD', masteredLevel1, ISL_LEARN_ITEMS), 'A');
});

test('islCourseCurriculum - calculateCourseProgress computes accurate completion metrics', () => {
  const progressEmpty = calculateCourseProgress(new Set());
  assert.strictEqual(progressEmpty.coreMastered, 0);
  assert.strictEqual(progressEmpty.corePct, 0);
  assert.strictEqual(progressEmpty.coreTotal, CORE_PATH_GLOSSES.length);

  const partialSet = new Set(['NAMASTE', 'HELLO', 'GOOD_MORNING']);
  const progressPartial = calculateCourseProgress(partialSet);
  assert.strictEqual(progressPartial.coreMastered, 3);
  assert.strictEqual(progressPartial.corePct > 0, true);
  assert.strictEqual(progressPartial.levelStats[0].mastered, 3);
});
