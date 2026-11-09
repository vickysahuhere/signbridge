import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFile = path.resolve(__dirname, '../src/ai/islTargetLandmarks.js');
let content = fs.readFileSync(targetFile, 'utf8');

// Find where section 2 begins
const marker = '// 2. ISL ALPHABET (FINGERSPELLING)';
const markerIndex = content.indexOf(marker);
if (markerIndex === -1) {
  console.error('Could not find marker:', marker);
  process.exit(1);
}

// Find where ISL_LEARN_ITEMS array ends
const closingMarker = '\n]);\n\n/**\n * Quick dictionary lookup by ID or Gloss label';
const closingIndex = content.indexOf(closingMarker);
if (closingIndex === -1) {
  console.error('Could not find closing marker');
  process.exit(1);
}

const alphabetSpecs = [
  {
    letter: 'A',
    vowelIndex: 1,
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'Thumb Tip (Joint #4)',
    targetType: 'Two-Handed ISL Vowel #1',
    description: 'Touch the tip of your non-dominant thumb with your dominant index finger. (Or single-handed: closed fist with thumb upright along the side).',
    tip: 'Vowel #1: Dominant index points to thumb tip of non-dominant hand.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[4]), dist3D(right.points[8], left.points[4]));
        const ok = d < 0.16;
        checklist.push({ id: 'contact', label: 'Index touching thumb tip', status: ok ? 'pass' : (d < 0.25 ? 'warn' : 'fail'), current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch thumb tip with index finger.' });
        if (ok) score += 35;
        else if (d < 0.25) score += 15;
      } else {
        const h = right || left;
        if (h && h.isFist && h.thumb.isExtended) {
          checklist.push({ id: 'single_a', label: 'Fist with thumb up (Single-hand)', status: 'pass', current: 'Fist + Thumb (✔)', target: 'Fist + Thumb', hint: '' });
          score += 55;
        } else {
          checklist.push({ id: 'hands', label: 'Hand detected', status: h ? 'warn' : 'fail', current: h ? '1 hand' : 'No hands', target: '2 hands', hint: 'Bring both hands into view.' });
        }
      }
    `,
    guidance: 'Touch your non-dominant thumb tip with your dominant index finger.'
  },
  {
    letter: 'B',
    isTwoHanded: true,
    leftPose: 'pinched',
    rightPose: 'pinched',
    keyTarget: 'Both Thumb+Index Circles',
    targetType: 'Two-Handed Binocular Circles',
    description: 'Both hands form circles with thumb and index touching, joined together like binoculars (or 4 straight fingers upright with thumb folded).',
    tip: 'Circles joined together at finger tips or 4 upright fingers.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.16;
        checklist.push({ id: 'contact', label: 'Hands joined together', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Bring both hands together.' });
        if (ok) score += 35;
      } else {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'fail', current: '1 hand', target: '2 hands', hint: 'Use both hands.' });
      }
    `,
    guidance: 'Join both hands together forming circles like binoculars.'
  },
  {
    letter: 'C',
    isTwoHanded: false,
    leftPose: null,
    rightPose: 'cupped',
    keyTarget: 'Open Curved C Arc',
    targetType: 'Single-Handed Arc',
    description: 'Hand curved into a clear, open "C" shape with thumb and fingers arched facing inward.',
    tip: 'Single-handed: Form a curved C arc with thumb below and fingers above.',
    checkCode: `
      const h = right || left;
      if (h) {
        checklist.push({ id: 'hand', label: 'Hand active', status: 'pass', current: '1 hand (✔)', target: '1 hand', hint: '' });
        score += 25;
        const d = dist3D(h.points[4], h.points[8]);
        const ok = d > 0.06 && d < 0.22;
        checklist.push({ id: 'c_shape', label: 'Curved "C" opening', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm opening', target: '6-22 cm', hint: 'Curve fingers and thumb into a C.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Form an open curved C shape with thumb and fingers.'
  },
  {
    letter: 'D',
    isTwoHanded: true,
    leftPose: 'point_up',
    rightPose: 'cupped',
    keyTarget: 'Round D on Upright Index',
    targetType: 'Two-Handed "D"',
    description: 'Non-dominant index pointing vertically up; dominant thumb and index form a curved semicircle touching its tip and base to form a "D".',
    tip: 'Form a round D arc against vertical index finger.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[8]), dist3D(right.points[8], left.points[8]));
        const ok = d < 0.18;
        checklist.push({ id: 'contact', label: 'Index touching semicircle', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Touch dominant index to non-dominant index.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Form a round D shape against your upright vertical index finger.'
  },
  {
    letter: 'E',
    vowelIndex: 2,
    isTwoHanded: true,
    leftPose: 'point_up',
    rightPose: 'point_forward',
    keyTarget: 'Index Fingertip (Joint #8)',
    targetType: 'Two-Handed ISL Vowel #2',
    description: 'Touch the tip of your non-dominant index finger with your dominant index finger.',
    tip: 'Vowel #2: Dominant index points to non-dominant index fingertip.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.16;
        checklist.push({ id: 'contact', label: 'Index fingertips touching', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch index fingertips together.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Touch non-dominant index fingertip with dominant index finger.'
  },
  {
    letter: 'F',
    isTwoHanded: true,
    leftPose: 'peace',
    rightPose: 'peace',
    keyTarget: 'Two Fingers Crossed Horizontally',
    targetType: 'Two-Handed Crossed Fingers',
    description: 'Dominant index and middle fingers placed horizontally across non-dominant index and middle fingers.',
    tip: 'Two fingers crossed horizontally across two fingers.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.16;
        checklist.push({ id: 'crossed', label: 'Fingers crossed together', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Cross index & middle fingers.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Place dominant index and middle horizontally across non-dominant fingers.'
  },
  {
    letter: 'G',
    isTwoHanded: true,
    leftPose: 'fist',
    rightPose: 'fist',
    keyTarget: 'Both Fists Stacked / Meeting',
    targetType: 'Two-Handed Fists',
    description: 'Dominant fist placed on top of or against non-dominant fist (or index and thumb pointing horizontally).',
    tip: 'Fists stacked or horizontal index.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.wrist, right.wrist);
        const ok = d < 0.22 && (left.isFist || right.isFist);
        checklist.push({ id: 'fists', label: 'Fists touching', status: ok ? 'pass' : 'warn', current: Math.round(d * 100) + ' cm', target: '< 22 cm', hint: 'Close fists together.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Place dominant fist against or stacked on non-dominant fist.'
  },
  {
    letter: 'H',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'open',
    keyTarget: 'Flat Open Hands Crossed',
    targetType: 'Two-Handed Palm Cross',
    description: 'Dominant flat open palm placed flat across non-dominant open palm.',
    tip: 'Flat hand sweeping across palm.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.wrist, right.palmCenter), dist3D(right.wrist, left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'palms', label: 'Palms crossing', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest flat hand across palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Place dominant flat open palm across non-dominant palm.'
  },
  {
    letter: 'I',
    vowelIndex: 3,
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'Middle Fingertip (Joint #12)',
    targetType: 'Two-Handed ISL Vowel #3',
    description: 'Touch the tip of your non-dominant middle finger with your dominant index finger. (Or single-handed: pinky extended straight up from fist).',
    tip: 'Vowel #3: Dominant index points to non-dominant middle fingertip.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[12]), dist3D(right.points[8], left.points[12]));
        const ok = d < 0.16;
        checklist.push({ id: 'middle_touch', label: 'Index touching middle tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch middle fingertip.' });
        if (ok) score += 35;
      } else {
        const h = right || left;
        if (h && h.pinky.isExtended && h.curledCount >= 3) {
          checklist.push({ id: 'pinky_up', label: 'Pinky extended upright', status: 'pass', current: 'Pinky Up (✔)', target: 'Pinky up', hint: '' });
          score += 55;
        }
      }
    `,
    guidance: 'Touch non-dominant middle fingertip with dominant index finger.'
  },
  {
    letter: 'J',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'J-Stroke on Flat Palm',
    targetType: 'Two-Handed Trace',
    description: 'Dominant index touches non-dominant middle fingertip and draws a "J" curve down the palm to the wrist.',
    tip: 'Trace down palm from middle finger.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.palmCenter), dist3D(right.points[8], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'palm_trace', label: 'Index on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Touch index to palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Touch middle finger and trace a J down the non-dominant palm.'
  },
  {
    letter: 'K',
    isTwoHanded: true,
    leftPose: 'point_up',
    rightPose: 'cupped',
    keyTarget: 'Dominant Index Hooked on Knuckle',
    targetType: 'Two-Handed Hook',
    description: 'Dominant index finger hooked/bent touching the first knuckle/joint of non-dominant extended index finger.',
    tip: 'Hooked finger on index joint.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[6]), dist3D(right.points[8], left.points[6]));
        const ok = d < 0.16;
        checklist.push({ id: 'hook_touch', label: 'Hook on index joint', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch index joint.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Hook dominant index finger onto the knuckle of non-dominant index.'
  },
  {
    letter: 'L',
    isTwoHanded: false,
    leftPose: null,
    rightPose: 'point_up',
    keyTarget: 'Thumb and Index at 90°',
    targetType: 'ISL Letter L',
    description: 'Extend thumb and index finger at a sharp 90-degree angle to form an "L" shape, keeping other three fingers curled.',
    tip: 'Clear 90-degree right angle between thumb and index.',
    checkCode: `
      const h = right || left;
      if (h) {
        checklist.push({ id: 'hand', label: 'Hand active', status: 'pass', current: '1 hand (✔)', target: '1 hand', hint: '' });
        score += 25;
        const ok = h.thumb.isExtended && h.index.isExtended;
        checklist.push({ id: 'l_shape', label: 'Thumb + Index extended', status: ok ? 'pass' : 'fail', current: ok ? 'L-shape (✔)' : 'Extend thumb & index', target: '90 deg angle', hint: 'Extend thumb and index.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Form an L shape with your thumb and index finger at 90 degrees.'
  },
  {
    letter: 'M',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'open',
    keyTarget: '3 Fingers Resting on Palm',
    targetType: 'Two-Handed 3-Finger Rest',
    description: 'Dominant 3 fingers (index, middle, ring) resting downward onto non-dominant flat palm.',
    tip: '3 fingers resting on palm.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[12], right.palmCenter), dist3D(right.points[12], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'fingers_palm', label: '3 fingers on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest 3 fingers on palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Rest dominant 3 fingers (index, middle, ring) onto non-dominant palm.'
  },
  {
    letter: 'N',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'peace',
    keyTarget: '2 Fingers Resting on Palm',
    targetType: 'Two-Handed 2-Finger Rest',
    description: 'Dominant 2 fingers (index, middle) resting downward onto non-dominant flat palm.',
    tip: '2 fingers resting on palm.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.palmCenter), dist3D(right.points[8], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'fingers_palm', label: '2 fingers on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest 2 fingers on palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Rest dominant 2 fingers (index, middle) onto non-dominant palm.'
  },
  {
    letter: 'O',
    vowelIndex: 4,
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'Ring Fingertip (Joint #16)',
    targetType: 'Two-Handed ISL Vowel #4',
    description: 'Touch the tip of your non-dominant ring finger with your dominant index finger. (Or single-handed: all fingertips touching thumb tip forming an O).',
    tip: 'Vowel #4: Dominant index points to non-dominant ring fingertip.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[16]), dist3D(right.points[8], left.points[16]));
        const ok = d < 0.16;
        checklist.push({ id: 'ring_touch', label: 'Index touching ring tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch ring fingertip.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Touch non-dominant ring fingertip with dominant index finger.'
  },
  {
    letter: 'P',
    isTwoHanded: true,
    leftPose: 'point_up',
    rightPose: 'pinched',
    keyTarget: 'Circle Touching Vertical Index Tip',
    targetType: 'Two-Handed "P"',
    description: 'Dominant thumb and index form a circle loop touching the tip of non-dominant index finger pointing vertically up.',
    tip: 'Circle loop touching index tip.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[8]), dist3D(right.points[8], left.points[8]));
        const ok = d < 0.16;
        checklist.push({ id: 'loop_touch', label: 'Loop on index tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch circle to index tip.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Touch dominant thumb-index circle to the tip of vertical non-dominant index.'
  },
  {
    letter: 'Q',
    isTwoHanded: true,
    leftPose: 'thumbs_up',
    rightPose: 'pinched',
    keyTarget: 'Circle Hooked Around Thumb Base',
    targetType: 'Two-Handed "Q"',
    description: 'Dominant thumb and index form a circle hooked around the base of non-dominant extended thumb.',
    tip: 'Circle hooked onto thumb.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[4]), dist3D(right.points[8], left.points[4]));
        const ok = d < 0.16;
        checklist.push({ id: 'thumb_hook', label: 'Circle hooked around thumb', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Hook circle around thumb.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Hook dominant thumb-index circle around the base of non-dominant thumb.'
  },
  {
    letter: 'R',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'cupped',
    keyTarget: 'Curved Index on Center Palm',
    targetType: 'Two-Handed Hooked Palm',
    description: 'Dominant hooked/curved index finger resting on the center of non-dominant flat palm.',
    tip: 'Hooked finger on palm.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.palmCenter), dist3D(right.points[8], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'hook_palm', label: 'Curved index on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest curved index on palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Rest dominant curved index finger on center of non-dominant flat palm.'
  },
  {
    letter: 'S',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'fist',
    keyTarget: 'Fist on Palm or Pinkies Linked',
    targetType: 'Two-Handed Fist / Pinky Hook',
    description: 'Dominant pinky finger hooked with non-dominant pinky finger, or dominant closed fist resting against non-dominant palm.',
    tip: 'Pinkies linked or fist on palm.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.palmCenter, right.palmCenter);
        const ok = d < 0.20;
        checklist.push({ id: 'fist_palm', label: 'Fist resting on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 20 cm', hint: 'Rest fist against palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Rest dominant closed fist against non-dominant palm or link pinkies.'
  },
  {
    letter: 'T',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'Index Touching Pinky Side Edge of Palm',
    targetType: 'Two-Handed Edge Touch',
    description: 'Dominant extended index finger touching the side edge of non-dominant flat palm near the pinky base.',
    tip: 'Index touching side edge of palm.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[17]), dist3D(right.points[8], left.points[17]));
        const ok = d < 0.16;
        checklist.push({ id: 'edge_touch', label: 'Index on palm edge', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch side edge of palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Touch dominant index finger to the side pinky edge of non-dominant palm.'
  },
  {
    letter: 'U',
    vowelIndex: 5,
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'Pinky Fingertip (Joint #20)',
    targetType: 'Two-Handed ISL Vowel #5',
    description: 'Touch the tip of your non-dominant pinky finger with your dominant index finger. (Or single-handed: index and middle extended together).',
    tip: 'Vowel #5: Dominant index points to non-dominant pinky fingertip.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[20]), dist3D(right.points[8], left.points[20]));
        const ok = d < 0.16;
        checklist.push({ id: 'pinky_touch', label: 'Index touching pinky tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch pinky tip.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Touch non-dominant pinky fingertip with dominant index finger.'
  },
  {
    letter: 'V',
    isTwoHanded: false,
    leftPose: null,
    rightPose: 'peace',
    keyTarget: 'Separated V Peace Sign',
    targetType: 'ISL Letter V',
    description: 'Extend your index and middle fingers upward in a separated "V" (peace sign), with thumb holding down ring and pinky fingers.',
    tip: 'Spread index and middle apart into a V.',
    checkCode: `
      const h = right || left;
      if (h) {
        checklist.push({ id: 'hand', label: 'Hand active', status: 'pass', current: '1 hand (✔)', target: '1 hand', hint: '' });
        score += 25;
        const ok = h.index.isExtended && h.middle.isExtended && dist3D(h.points[8], h.points[12]) > 0.04;
        checklist.push({ id: 'v_shape', label: 'Index + Middle in V shape', status: ok ? 'pass' : 'fail', current: ok ? 'V shape (✔)' : 'Spread V fingers', target: 'Spread V', hint: 'Extend index and middle in a V.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Spread index and middle fingers into a V peace sign.'
  },
  {
    letter: 'W',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'open',
    keyTarget: 'Interlaced Open Palms',
    targetType: 'Two-Handed Interlaced',
    description: 'Both hands with open palms, fingers interlaced together (or single-handed 3 fingers spread up).',
    tip: 'Interlaced fingers / 3 fingers up.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.palmCenter, right.palmCenter);
        const ok = d < 0.18;
        checklist.push({ id: 'interlaced', label: 'Hands interlaced together', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Interlace fingers of both palms.' });
        if (ok) score += 35;
      } else {
        const h = right || left;
        if (h && h.index.isExtended && h.middle.isExtended && h.ring.isExtended) {
          checklist.push({ id: 'w_single', label: '3 fingers extended (Single-hand)', status: 'pass', current: '3 Fingers (✔)', target: '3 fingers', hint: '' });
          score += 55;
        }
      }
    `,
    guidance: 'Interlace fingers of both open palms together facing camera.'
  },
  {
    letter: 'X',
    isTwoHanded: true,
    leftPose: 'point_forward',
    rightPose: 'point_forward',
    keyTarget: 'Both Index Fingers Crossed',
    targetType: 'Two-Handed Crossed X',
    description: 'Both index fingers crossed over each other to form an "X".',
    tip: 'Crossed index fingers.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.15;
        checklist.push({ id: 'crossed_x', label: 'Index fingers crossed', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 15 cm', hint: 'Cross index fingers.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Cross both extended index fingers over each other to form an X.'
  },
  {
    letter: 'Y',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'point_forward',
    keyTarget: 'Index in Thumb-Index Cleft',
    targetType: 'Two-Handed Crotch Touch',
    description: 'Dominant index finger placed into the V-crotch between non-dominant extended thumb and index finger (or thumb and pinky extended).',
    tip: 'Index in thumb-index crotch.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[2]), dist3D(right.points[8], left.points[2]));
        const ok = d < 0.16;
        checklist.push({ id: 'y_cleft', label: 'Index in thumb cleft', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Place index into thumb cleft.' });
        if (ok) score += 35;
      } else {
        const h = right || left;
        if (h && h.thumb.isExtended && h.pinky.isExtended) {
          checklist.push({ id: 'y_single', label: 'Y-Shape (Thumb+Pinky)', status: 'pass', current: 'Y-Hand (✔)', target: 'Thumb+Pinky', hint: '' });
          score += 55;
        }
      }
    `,
    guidance: 'Place dominant index finger into the crotch between thumb and index finger.'
  },
  {
    letter: 'Z',
    isTwoHanded: true,
    leftPose: 'open',
    rightPose: 'open',
    keyTarget: 'Flat Hand Along Opposite Hand Edge',
    targetType: 'Two-Handed Flat Hand Edge',
    description: 'Dominant flat hand resting along the upper edge of non-dominant flat hand.',
    tip: 'Flat hand on hand edge.',
    checkCode: `
      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[17]), dist3D(right.points[8], left.points[17]));
        const ok = d < 0.16;
        checklist.push({ id: 'hand_edge', label: 'Hand along opposite edge', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Rest hand along edge of palm.' });
        if (ok) score += 35;
      }
    `,
    guidance: 'Rest dominant flat hand along the upper edge of non-dominant flat hand.'
  }
];

function generateAlphabetBlock() {
  const lines = [];
  lines.push('  // =========================================================================');
  lines.push('  // 2. ISL ALPHABET (FINGERSPELLING: ALL 26 LETTERS A-Z)');
  lines.push('  // =========================================================================');

  for (const item of alphabetSpecs) {
    const l = item.letter;
    const lower = l.toLowerCase();
    const vowelSuffix = item.vowelIndex ? ` (ISL Vowel #${item.vowelIndex})` : '';
    const leftHandSkeleton = item.leftPose ? `createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: '${item.leftPose}' })` : 'null';
    const rightHandSkeleton = `createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: '${item.rightPose}' })`;

    lines.push(`  {`);
    lines.push(`    id: 'alphabet_${lower}',`);
    lines.push(`    label: '${l}',`);
    lines.push(`    name: 'Letter ${l}',`);
    lines.push(`    category: 'alphabet',`);
    lines.push(`    type: 'alphabet',`);
    lines.push(`    english: 'Letter ${l}${vowelSuffix}',`);
    lines.push(`    image: '/signs/alphabet_${lower}.jpg',`);
    lines.push(`    description: ${JSON.stringify(item.description)},`);
    lines.push(`    tip: ${JSON.stringify(item.tip)},`);
    lines.push(`    targetSkeleton: {`);
    lines.push(`      leftHand: ${leftHandSkeleton},`);
    lines.push(`      rightHand: ${rightHandSkeleton},`);
    lines.push(`      pose: BASE_POSE_LANDMARKS`);
    lines.push(`    },`);
    lines.push(`    blueprint: {`);
    lines.push(`      type: ${JSON.stringify(item.targetType)},`);
    lines.push(`      keyTarget: ${JSON.stringify(item.keyTarget)}`);
    lines.push(`    },`);
    lines.push(`    evaluate: (landmarks) => {`);
    lines.push(`      const left = analyzeHand(landmarks?.leftHandLandmarks);`);
    lines.push(`      const right = analyzeHand(landmarks?.rightHandLandmarks);`);
    lines.push(`      const pose = landmarks?.poseLandmarks;`);
    lines.push(`      const checklist = [];`);
    lines.push(`      let score = 0;`);
    lines.push(`      if (!left && !right) {`);
    lines.push(`        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: ${JSON.stringify(item.guidance)} };`);
    lines.push(`      }`);
    lines.push(``);
    lines.push(`      // 1. Biometric Alphabet Classifier Engine`);
    lines.push(`      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);`);
    lines.push(`      const topPred = candidates[0];`);
    lines.push(`      const matchPred = candidates.find(c => c.label === '${l}');`);
    lines.push(`      if (topPred && topPred.label === '${l}') {`);
    lines.push(`        score += 45;`);
    lines.push(`      } else if (matchPred && matchPred.confidence >= 0.70) {`);
    lines.push(`        score += 25;`);
    lines.push(`      }`);
    lines.push(``);
    lines.push(`      // 2. Specific Biomechanical Verification`);
    lines.push(item.checkCode);
    lines.push(``);
    lines.push(`      const isMatched = score >= 75;`);
    lines.push(`      const primaryGuidance = isMatched ? 'Letter ${l} confirmed!' : ${JSON.stringify(item.guidance)};`);
    lines.push(`      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };`);
    lines.push(`    }`);
    lines.push(`  },`);
  }

  // Remove trailing comma from last item
  const lastLine = lines[lines.length - 1];
  lines[lines.length - 1] = lastLine.slice(0, -1);

  return lines.join('\n');
}

const newAlphabetSection = generateAlphabetBlock();
const beforeSection = content.substring(0, markerIndex);
const afterSection = content.substring(closingIndex);

const updatedContent = beforeSection + newAlphabetSection + afterSection;
fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log('Successfully updated islTargetLandmarks.js with all 26 alphabets!');
