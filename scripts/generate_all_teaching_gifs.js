import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const signsDir = path.resolve(__dirname, '../public/signs');

if (!fs.existsSync(signsDir)) {
  fs.mkdirSync(signsDir, { recursive: true });
}

async function createAnimatedTeachingGif(filename, frames, delays = [850, 850, 950]) {
  const outputPath = path.join(signsDir, filename);
  const width = 440;
  const height = 330;

  const pngBuffers = await Promise.all(
    frames.map(svg => sharp(Buffer.from(svg.trim())).png().toBuffer())
  );

  let stacked = sharp(pngBuffers[0]);
  const composites = [];
  for (let i = 1; i < pngBuffers.length; i++) {
    composites.push({
      input: pngBuffers[i],
      top: i * height,
      left: 0
    });
  }

  const stackedBuffer = await stacked
    .extend({ bottom: (pngBuffers.length - 1) * height })
    .composite(composites)
    .png()
    .toBuffer();

  await sharp(stackedBuffer)
    .gif({
      pageHeight: height,
      loop: 0,
      delay: delays
    })
    .toFile(outputPath);

  // Also write the steady keyframe as a pristine JPG
  const keyframeJpgPath = outputPath.replace('.gif', '.jpg');
  await sharp(pngBuffers[pngBuffers.length - 1])
    .jpeg({ quality: 92 })
    .toFile(keyframeJpgPath);

  console.log(`[Created Teaching GIF & JPG]: ${filename} & ${path.basename(keyframeJpgPath)}`);
}

function sanitizeXml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function frame(title, stepNum, totalSteps, stepText, bgAccent, graphicSvg) {
  const safeTitle = sanitizeXml(title);
  const safeStepText = sanitizeXml(stepText);
  return `
  <svg width="440" height="330" viewBox="0 0 440 330" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Outer Card Border -->
    <rect width="440" height="330" rx="10" fill="#FAF8F5"/>
    <rect x="5" y="5" width="430" height="320" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>

    <!-- Header Strip -->
    <rect x="5" y="5" width="430" height="42" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
    <text x="18" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="#18181B" letter-spacing="0.5">
      ${safeTitle}
    </text>
    <rect x="290" y="13" width="135" height="26" rx="6" fill="${bgAccent}" stroke="#18181B" stroke-width="1.5"/>
    <text x="357" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="900" fill="#18181B" text-anchor="middle">
      ISL TEACHING GUIDE
    </text>

    <!-- Stage Center Background Aura -->
    <circle cx="220" cy="155" r="78" fill="${bgAccent}" fill-opacity="0.18"/>

    <!-- Graphic Anatomy -->
    <g transform="translate(0, 42)">
      ${graphicSvg}
    </g>

    <!-- Bottom Step Guidance Pill -->
    <rect x="15" y="276" width="410" height="40" rx="8" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
    <rect x="23" y="284" width="48" height="24" rx="5" fill="#18181B"/>
    <text x="47" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="900" fill="#FFFFFF" text-anchor="middle">
      ${stepNum}/${totalSteps}
    </text>
    <text x="80" y="301" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#18181B">
      ${safeStepText}
    </text>
  </svg>
  `;
}

async function generateAll() {
  console.log('Generating authentic easy-going ISL teaching GIFs...');

  // 1. HELP (Fist on Flat Palm Lifting Upward)
  await createAnimatedTeachingGif('help.gif', [
    frame('HELP (मदद)', 1, 3, 'Form flat non-dominant palm & dominant fist', '#22C55E', `
      <!-- Base flat palm -->
      <rect x="140" y="135" width="160" height="26" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
      <rect x="148" y="139" width="30" height="18" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      <!-- Fist hovering above -->
      <g transform="translate(190, 50)">
        <rect x="0" y="0" width="60" height="55" rx="12" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 25 C-8 25 -10 38 -5 45 C0 50 10 50 20 45" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="16" y1="0" x2="16" y2="30" stroke="#18181B" stroke-width="2"/>
        <line x1="32" y1="0" x2="32" y2="30" stroke="#18181B" stroke-width="2"/>
        <line x1="48" y1="0" x2="48" y2="30" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Target alignment arrow -->
      <path d="M220 112 L220 128" stroke="#38BDF8" stroke-width="3" stroke-linecap="round"/>
      <path d="M214 122 L220 128 L226 122" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('HELP (मदद)', 2, 3, 'Rest fist on palm and lift both upward', '#22C55E', `
      <!-- Base flat palm -->
      <rect x="140" y="130" width="160" height="26" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
      <rect x="148" y="134" width="30" height="18" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      <!-- Fist resting directly on palm -->
      <g transform="translate(190, 78)">
        <rect x="0" y="0" width="60" height="55" rx="12" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 25 C-8 25 -10 38 -5 45 C0 50 10 50 20 45" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="16" y1="0" x2="16" y2="30" stroke="#18181B" stroke-width="2"/>
        <line x1="32" y1="0" x2="32" y2="30" stroke="#18181B" stroke-width="2"/>
        <line x1="48" y1="0" x2="48" y2="30" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Upward motion arrows on both sides -->
      <path d="M115 140 L115 95 M109 105 L115 95 L121 105" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M325 140 L325 95 M319 105 L325 95 L331 105" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('HELP (मदद)', 3, 3, 'Lift together at chest level & hold steady', '#22C55E', `
      <!-- Both hands lifted 2 inches higher -->
      <rect x="140" y="100" width="160" height="26" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
      <rect x="148" y="104" width="30" height="18" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      <g transform="translate(190, 48)">
        <rect x="0" y="0" width="60" height="55" rx="12" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 25 C-8 25 -10 38 -5 45 C0 50 10 50 20 45" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="16" y1="0" x2="16" y2="30" stroke="#18181B" stroke-width="2"/>
        <line x1="32" y1="0" x2="32" y2="30" stroke="#18181B" stroke-width="2"/>
        <line x1="48" y1="0" x2="48" y2="30" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Green pulse halo -->
      <circle cx="220" cy="100" r="85" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="220" y="195" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">HOLD STEADY (✓ RECOGNIZED)</text>
    `)
  ]);

  // 2. YES (Fist Nodding Vertically)
  await createAnimatedTeachingGif('yes.gif', [
    frame('YES (हाँ)', 1, 3, 'Hold closed fist at mid-chest height', '#22C55E', `
      <g transform="translate(185, 80)">
        <rect x="0" y="0" width="70" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 30 C-10 30 -12 45 -6 54 C0 60 12 60 24 54" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="20" y1="0" x2="20" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="38" y1="0" x2="38" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="56" y1="0" x2="56" y2="38" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Neutral Start Position</text>
    `),
    frame('YES (हाँ)', 2, 3, 'Nod fist downwards like nodding your head', '#22C55E', `
      <g transform="translate(185, 115) rotate(15, 35, 32)">
        <rect x="0" y="0" width="70" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 30 C-10 30 -12 45 -6 54 C0 60 12 60 24 54" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="20" y1="0" x2="20" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="38" y1="0" x2="38" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="56" y1="0" x2="56" y2="38" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Downward nodding arrow -->
      <path d="M285 75 L285 145 M277 135 L285 145 L293 135" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="210" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#15803D" text-anchor="middle">Downward Nod Stroke</text>
    `),
    frame('YES (हाँ)', 3, 3, 'Tilt back up smoothly & repeat nod', '#22C55E', `
      <g transform="translate(185, 75)">
        <rect x="0" y="0" width="70" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 30 C-10 30 -12 45 -6 54 C0 60 12 60 24 54" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="20" y1="0" x2="20" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="38" y1="0" x2="38" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="56" y1="0" x2="56" y2="38" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Up and down oscillation indicator -->
      <path d="M285 70 L285 140 M278 80 L285 70 L292 80 M278 130 L285 140 L292 130" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ 2 Smooth Nods Confirms Sign</text>
    `)
  ]);

  // 3. NO (Side-to-Side Waving Hand)
  await createAnimatedTeachingGif('no.gif', [
    frame('NO (नहीं)', 1, 3, 'Open hand facing forward at chest level', '#EF4444', `
      <g transform="translate(185, 60)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="10" width="10" height="38" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="6" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="9" width="10" height="39" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="18" width="10" height="30" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Center Position</text>
    `),
    frame('NO (नहीं)', 2, 3, 'Wave hand smoothly to the right', '#EF4444', `
      <g transform="translate(225, 60) rotate(12, 40, 50)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="10" width="10" height="38" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="6" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="9" width="10" height="39" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="18" width="10" height="30" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Right wave arrow -->
      <path d="M140 180 L290 180 M280 173 L290 180 L280 187" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('NO (नहीं)', 3, 3, 'Wave hand smoothly to the left & repeat', '#EF4444', `
      <g transform="translate(145, 60) rotate(-12, 40, 50)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="10" width="10" height="38" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="6" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="9" width="10" height="39" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="18" width="10" height="30" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Left wave arrow -->
      <path d="M290 180 L140 180 M150 173 L140 180 L150 187" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="205" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#DC2626" text-anchor="middle">✓ Smooth Side-to-Side Wave</text>
    `)
  ]);

  // 4. HELLO (Temple Outward Wave)
  await createAnimatedTeachingGif('hello.gif', [
    frame('HELLO (नमस्ते / हैलो)', 1, 3, 'Place open palm near temple/forehead', '#38BDF8', `
      <g transform="translate(190, 50)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="8" width="10" height="40" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="4" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="7" width="10" height="41" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="16" width="10" height="32" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Temple Head silhouette guide -->
      <path d="M120 50 C100 50 85 70 85 100 C85 130 100 150 120 150" stroke="#CBD5E1" stroke-width="3" stroke-dasharray="4 4" fill="none"/>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Hand at Temple Level</text>
    `),
    frame('HELLO (नमस्ते / हैलो)', 2, 3, 'Wave palm gently outward toward viewer', '#38BDF8', `
      <g transform="translate(230, 50) rotate(18, 40, 50)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="8" width="10" height="40" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="4" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="7" width="10" height="41" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="16" width="10" height="32" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Gentle outward wave arc -->
      <path d="M185 100 C210 75 250 85 270 105" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M260 106 L270 105 L266 95" stroke="#38BDF8" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('HELLO (नमस्ते / हैलो)', 3, 3, 'Hold open palm steady for greeting', '#38BDF8', `
      <g transform="translate(210, 50)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="8" width="10" height="40" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="4" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="7" width="10" height="41" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="16" width="10" height="32" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="245" cy="100" r="75" stroke="#22C55E" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Raised Palm Steady</text>
    `)
  ]);

  // 5. LOVE (Iconic ILY / Chest Heart Touch)
  await createAnimatedTeachingGif('love.gif', [
    frame('LOVE (प्यार)', 1, 3, 'Form thumb, index & pinky handshape', '#EC4899', `
      <g transform="translate(180, 60)">
        <rect x="15" y="45" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <!-- Folded middle & ring -->
        <rect x="30" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="42" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <!-- Extended Index & Pinky -->
        <rect x="18" y="6" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="54" y="14" width="10" height="36" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <!-- Extended Thumb sideways -->
        <path d="M18 68 C2 68 -4 56 0 46 C4 38 12 42 20 50" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Thumb + Index + Pinky Extended</text>
    `),
    frame('LOVE (प्यार)', 2, 3, 'Hold steadily in front of heart / chest', '#EC4899', `
      <g transform="translate(180, 55)">
        <rect x="15" y="45" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="30" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="42" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="18" y="6" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="54" y="14" width="10" height="36" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M18 68 C2 68 -4 56 0 46 C4 38 12 42 20 50" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <!-- Heart Symbol -->
      <path d="M220 170 C220 155 200 155 200 172 C200 190 220 202 220 202 C220 202 240 190 240 172 C240 155 220 155 220 170 Z" fill="#EC4899" stroke="#18181B" stroke-width="2"/>
    `),
    frame('LOVE (प्यार)', 3, 3, 'Hold posture calm and steady', '#EC4899', `
      <g transform="translate(180, 55)">
        <rect x="15" y="45" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="30" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="42" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="18" y="6" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="54" y="14" width="10" height="36" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M18 68 C2 68 -4 56 0 46 C4 38 12 42 20 50" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="220" cy="110" r="75" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold at Chest Height</text>
    `)
  ]);

  // 6. THANK_YOU (Fingertips to chin moving forward)
  await createAnimatedTeachingGif('thank_you.gif', [
    frame('THANK YOU (धन्यवाद)', 1, 3, 'Touch flat fingertips gently to chin', '#FFD15C', `
      <!-- Face profile guide -->
      <path d="M150 40 C130 40 115 55 115 80 C115 105 125 115 145 115" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Flat hand touching chin -->
      <g transform="translate(135, 85)">
        <rect x="0" y="0" width="55" height="45" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M20 0 L20 -28 C20 -34 32 -34 32 -28 L32 0 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Fingertips at Chin</text>
    `),
    frame('THANK YOU (धन्यवाद)', 2, 3, 'Move hand smoothly outward toward partner', '#FFD15C', `
      <g transform="translate(195, 75)">
        <rect x="0" y="0" width="60" height="45" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M25 0 L25 -28 C25 -34 37 -34 37 -28 L37 0 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Forward arc arrow -->
      <path d="M150 110 C180 110 220 90 250 80" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M240 76 L250 80 L244 88" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('THANK YOU (धन्यवाद)', 3, 3, 'Open hand resting facing partner', '#FFD15C', `
      <g transform="translate(225, 75)">
        <rect x="0" y="0" width="60" height="45" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M25 0 L25 -28 C25 -34 37 -34 37 -28 L37 0 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="255" cy="90" r="60" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Palm Forward in Thanks</text>
    `)
  ]);

  // 7. EAT (Pinched Tips to Mouth)
  await createAnimatedTeachingGif('eat.gif', [
    frame('EAT (खाना)', 1, 3, 'Cluster all 5 fingertips together', '#F59E0B', `
      <g transform="translate(150, 75)">
        <rect x="0" y="30" width="55" height="45" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M45 40 C60 40 72 32 76 25 C70 18 58 18 45 22 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <!-- Profile lips guide -->
      <path d="M280 65 C265 65 255 75 255 90 C255 102 265 110 275 110" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M255 90 C245 90 240 94 238 94" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Fingertips Pinched Together</text>
    `),
    frame('EAT (खाना)', 2, 3, 'Bring pinched fingertips gently to lips', '#F59E0B', `
      <g transform="translate(185, 75)">
        <rect x="0" y="30" width="55" height="45" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M45 40 C60 40 72 32 76 25 C70 18 58 18 45 22 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <path d="M280 65 C265 65 255 75 255 90 C255 102 265 110 275 110" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M255 90 C245 90 240 94 238 94" stroke="#EF4444" stroke-width="4" stroke-linecap="round"/>
      <!-- Approach arrow -->
      <path d="M210 120 L235 105 M225 103 L235 105 L231 114" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('EAT (खाना)', 3, 3, 'Touch tips near lips & repeat stroke', '#F59E0B', `
      <g transform="translate(195, 75)">
        <rect x="0" y="30" width="55" height="45" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M45 40 C60 40 72 32 76 25 C70 18 58 18 45 22 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <path d="M280 65 C265 65 255 75 255 90 C255 102 265 110 275 110" stroke="#CBD5E1" stroke-width="3" stroke-linecap="round" fill="none"/>
      <circle cx="250" cy="98" r="45" stroke="#22C55E" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Repeat Gentle Eating Stroke</text>
    `)
  ]);

  // 8. DRINK (Tilt Cupped Hand at Lips)
  await createAnimatedTeachingGif('drink.gif', [
    frame('DRINK (पीना)', 1, 3, 'Form C-shape like holding a small cup', '#0284C7', `
      <g transform="translate(180, 60)">
        <path d="M45 15 C20 15 8 35 8 58 C8 80 20 100 45 100 C54 100 62 94 64 85 C65 77 58 74 50 74 C34 74 28 65 28 58 C28 50 34 40 50 40 C58 40 65 37 64 29 C62 21 54 15 45 15 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Cupped Hand in Front of Mouth</text>
    `),
    frame('DRINK (पीना)', 2, 3, 'Tilt cupped hand up toward mouth', '#0284C7', `
      <g transform="translate(180, 50) rotate(-22, 45, 58)">
        <path d="M45 15 C20 15 8 35 8 58 C8 80 20 100 45 100 C54 100 62 94 64 85 C65 77 58 74 50 74 C34 74 28 65 28 58 C28 50 34 40 50 40 C58 40 65 37 64 29 C62 21 54 15 45 15 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <!-- Tilt curved arrow -->
      <path d="M260 70 C265 55 250 42 235 40" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M242 35 L235 40 L244 47" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('DRINK (पीना)', 3, 3, 'Hold tilted cup at mouth for confirmation', '#0284C7', `
      <g transform="translate(180, 50) rotate(-22, 45, 58)">
        <path d="M45 15 C20 15 8 35 8 58 C8 80 20 100 45 100 C54 100 62 94 64 85 C65 77 58 74 50 74 C34 74 28 65 28 58 C28 50 34 40 50 40 C58 40 65 37 64 29 C62 21 54 15 45 15 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="225" cy="95" r="60" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Tilted Cup Posture</text>
    `)
  ]);

  // 9. PLEASE (Flat palm circular rub on chest)
  await createAnimatedTeachingGif('please.gif', [
    frame('PLEASE (कृपया)', 1, 3, 'Place open flat palm flat on chest', '#10B981', `
      <g transform="translate(185, 60)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="10" width="10" height="38" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="6" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="9" width="10" height="39" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="18" width="10" height="30" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Palm Flat Against Center Chest</text>
    `),
    frame('PLEASE (कृपया)', 2, 3, 'Rub in a smooth clockwise circle on chest', '#10B981', `
      <g transform="translate(205, 50)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="10" width="10" height="38" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="6" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="9" width="10" height="39" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="18" width="10" height="30" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Circular clockwise arrow -->
      <path d="M260 110 A 45 45 0 1 1 230 70" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M238 64 L230 70 L239 77" stroke="#10B981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('PLEASE (कृपया)', 3, 3, 'Hold flat palm steadily on chest', '#10B981', `
      <g transform="translate(185, 60)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="10" width="10" height="38" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="6" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="9" width="10" height="39" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="18" width="10" height="30" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="220" cy="110" r="70" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Smooth Circular Rub Confirms</text>
    `)
  ]);

  // 10. SORRY (Fist circular rub over heart)
  await createAnimatedTeachingGif('sorry.gif', [
    frame('SORRY (माफ़ कीजिये)', 1, 3, 'Place closed fist over your heart', '#F59E0B', `
      <g transform="translate(185, 75)">
        <rect x="0" y="0" width="70" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 30 C-10 30 -12 45 -6 54 C0 60 12 60 24 54" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="20" y1="0" x2="20" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="38" y1="0" x2="38" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="56" y1="0" x2="56" y2="38" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Fist Placed Over Heart</text>
    `),
    frame('SORRY (माफ़ कीजिये)', 2, 3, 'Rub fist in a gentle circle over heart', '#F59E0B', `
      <g transform="translate(205, 65)">
        <rect x="0" y="0" width="70" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 30 C-10 30 -12 45 -6 54 C0 60 12 60 24 54" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="20" y1="0" x2="20" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="38" y1="0" x2="38" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="56" y1="0" x2="56" y2="38" stroke="#18181B" stroke-width="2"/>
      </g>
      <path d="M260 110 A 42 42 0 1 1 230 72" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M238 66 L230 72 L239 79" stroke="#F59E0B" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('SORRY (माफ़ कीजिये)', 3, 3, 'Hold fist steady over heart', '#F59E0B', `
      <g transform="translate(185, 75)">
        <rect x="0" y="0" width="70" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M0 30 C-10 30 -12 45 -6 54 C0 60 12 60 24 54" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="20" y1="0" x2="20" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="38" y1="0" x2="38" y2="38" stroke="#18181B" stroke-width="2"/>
        <line x1="56" y1="0" x2="56" y2="38" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="220" cy="107" r="70" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Gentle Circle Over Heart</text>
    `)
  ]);

  // 11. WELCOME (Both palms sweep inward)
  await createAnimatedTeachingGif('welcome.gif', [
    frame('WELCOME (स्वागत है)', 1, 3, 'Both open palms facing up, spread outward', '#10B981', `
      <!-- Left welcoming palm -->
      <g transform="translate(110, 70)">
        <rect x="0" y="30" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <path d="M20 30 L10 5 C10 0 25 0 25 5 L25 30 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Right welcoming palm -->
      <g transform="translate(280, 70)">
        <rect x="0" y="30" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <path d="M30 30 L40 5 C40 0 25 0 25 5 L25 30 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Both Hands Spread Outward</text>
    `),
    frame('WELCOME (स्वागत है)', 2, 3, 'Sweep both palms gracefully inward toward torso', '#10B981', `
      <g transform="translate(140, 75)">
        <rect x="0" y="30" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <path d="M20 30 L10 5 C10 0 25 0 25 5 L25 30 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <g transform="translate(250, 75)">
        <rect x="0" y="30" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <path d="M30 30 L40 5 C40 0 25 0 25 5 L25 30 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <!-- Inward curved arrows -->
      <path d="M120 120 C140 135 170 130 180 115" stroke="#22C55E" stroke-width="3" stroke-linecap="round" fill="none"/>
      <path d="M320 120 C300 135 270 130 260 115" stroke="#22C55E" stroke-width="3" stroke-linecap="round" fill="none"/>
    `),
    frame('WELCOME (स्वागत है)', 3, 3, 'Both palms resting in front of body', '#10B981', `
      <g transform="translate(160, 75)">
        <rect x="0" y="30" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <path d="M20 30 L10 5 C10 0 25 0 25 5 L25 30 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <g transform="translate(230, 75)">
        <rect x="0" y="30" width="50" height="40" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <path d="M30 30 L40 5 C40 0 25 0 25 5 L25 30 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="220" cy="115" r="75" stroke="#22C55E" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Welcoming Posture</text>
    `)
  ]);

  // 12. CALL (Phone hand near ear)
  await createAnimatedTeachingGif('call.gif', [
    frame('CALL (कॉल / फ़ोन)', 1, 3, 'Form Y-handshape: Extend thumb and pinky', '#6366F1', `
      <g transform="translate(180, 70)">
        <rect x="15" y="30" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <!-- Folded index, middle, ring -->
        <rect x="25" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="35" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="45" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <!-- Thumb up-left -->
        <path d="M15 45 C0 45 -5 32 0 22 C5 14 15 18 20 28" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <!-- Pinky down-right -->
        <path d="M65 65 C80 65 85 78 80 88 C75 96 65 92 60 82" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Extend Thumb and Pinky</text>
    `),
    frame('CALL (कॉल / फ़ोन)', 2, 3, 'Bring thumb beside ear and pinky toward mouth', '#6366F1', `
      <g transform="translate(205, 45)">
        <rect x="15" y="30" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="25" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="35" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="45" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <path d="M15 45 C0 45 -5 32 0 22 C5 14 15 18 20 28" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M65 65 C80 65 85 78 80 88 C75 96 65 92 60 82" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <!-- Head / ear outline -->
      <circle cx="160" cy="85" r="35" stroke="#CBD5E1" stroke-width="2.5" stroke-dasharray="4 4" fill="none"/>
      <!-- Ring sound waves -->
      <path d="M280 40 C290 50 290 65 280 75" stroke="#6366F1" stroke-width="3" stroke-linecap="round" fill="none"/>
    `),
    frame('CALL (कॉल / फ़ोन)', 3, 3, 'Hold phone hand steadily beside ear', '#6366F1', `
      <g transform="translate(205, 45)">
        <rect x="15" y="30" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="25" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="35" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="45" y="30" width="9" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <path d="M15 45 C0 45 -5 32 0 22 C5 14 15 18 20 28" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <path d="M65 65 C80 65 85 78 80 88 C75 96 65 92 60 82" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="245" cy="85" r="65" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Phone Hand Beside Ear</text>
    `)
  ]);

  // 13. GOOD_MORNING (Thumbs Up + Sunrise Arc)
  await createAnimatedTeachingGif('good_morning.gif', [
    frame('GOOD MORNING (शुभ प्रभात)', 1, 3, 'Step 1: Form Thumbs-Up at chest (Good)', '#FFC800', `
      <g transform="translate(185, 70)">
        <rect x="15" y="35" width="45" height="45" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="22" y="5" width="12" height="35" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#18181B" text-anchor="middle">Sign 1: "GOOD" (Thumbs Up)</text>
    `),
    frame('GOOD MORNING (शुभ प्रभात)', 2, 3, 'Step 2: Rise upward like sunrise (Morning)', '#FFC800', `
      <!-- Rising sun arc -->
      <g transform="translate(185, 60)">
        <circle cx="35" cy="40" r="22" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="35" y1="8" x2="35" y2="0" stroke="#FFC800" stroke-width="3" stroke-linecap="round"/>
        <line x1="12" y1="20" x2="6" y2="15" stroke="#FFC800" stroke-width="3" stroke-linecap="round"/>
        <line x1="58" y1="20" x2="64" y2="15" stroke="#FFC800" stroke-width="3" stroke-linecap="round"/>
      </g>
      <!-- Upward rising path arrow -->
      <path d="M140 140 C170 100 220 70 270 70" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M260 65 L270 70 L263 78" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="13" font-weight="900" fill="#18181B" text-anchor="middle">Sign 2: "MORNING" (Sunrise Arc)</text>
    `),
    frame('GOOD MORNING (शुभ प्रभात)', 3, 3, 'Compound: Good + Sunrise complete', '#FFC800', `
      <g transform="translate(130, 75)">
        <rect x="15" y="30" width="35" height="35" rx="6" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <rect x="20" y="6" width="10" height="28" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <g transform="translate(230, 50)">
        <circle cx="30" cy="30" r="20" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="220" cy="95" r="75" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Good + Morning Complete</text>
    `)
  ]);

  // 14. NAMASTE (Two Palms Pressed in Prayer at Chest)
  await createAnimatedTeachingGif('namaste.gif', [
    frame('NAMASTE (नमस्ते)', 1, 3, 'Bring both open palms toward center chest', '#FFD15C', `
      <g transform="translate(130, 70)">
        <rect x="0" y="25" width="45" height="55" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <line x1="15" y1="25" x2="15" y2="0" stroke="#FFD15C" stroke-width="8" stroke-linecap="round"/>
        <line x1="28" y1="25" x2="28" y2="-4" stroke="#FFD15C" stroke-width="8" stroke-linecap="round"/>
      </g>
      <g transform="translate(260, 70)">
        <rect x="0" y="25" width="45" height="55" rx="8" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="17" y1="25" x2="17" y2="-4" stroke="#FFD15C" stroke-width="8" stroke-linecap="round"/>
        <line x1="30" y1="25" x2="30" y2="0" stroke="#FFD15C" stroke-width="8" stroke-linecap="round"/>
      </g>
      <path d="M185 105 L210 105 M200 100 L210 105 L200 110" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M250 105 L225 105 M235 100 L225 105 L235 110" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Bring Palms Together</text>
    `),
    frame('NAMASTE (नमस्ते)', 2, 3, 'Press palms together in front of heart', '#FFD15C', `
      <g transform="translate(185, 60)">
        <path d="M20 70 L20 15 C20 8 35 8 35 15 L35 70 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M35 70 L35 15 C35 8 50 8 50 15 L50 70 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="35" y1="10" x2="35" y2="70" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="220" cy="95" r="65" stroke="#FFD15C" stroke-width="2" stroke-dasharray="5 5"/>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#B45309" text-anchor="middle">Fingers Pointing Upward</text>
    `),
    frame('NAMASTE (नमस्ते)', 3, 3, 'Hold prayer posture at chest level', '#FFD15C', `
      <g transform="translate(185, 60)">
        <path d="M20 70 L20 15 C20 8 35 8 35 15 L35 70 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <path d="M35 70 L35 15 C35 8 50 8 50 15 L50 70 Z" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <line x1="35" y1="10" x2="35" y2="70" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="220" cy="95" r="75" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold at Mid-Chest Level</text>
    `)
  ]);

  // 15. GOOD (Thumbs Up)
  await createAnimatedTeachingGif('good.gif', [
    frame('GOOD (अच्छा)', 1, 3, 'Form closed fist at chest level', '#22C55E', `
      <g transform="translate(185, 75)">
        <rect x="15" y="30" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="25" y="30" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
        <rect x="37" y="30" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Fist at Mid-Chest</text>
    `),
    frame('GOOD (अच्छा)', 2, 3, 'Extend thumb straight up with upward stroke', '#22C55E', `
      <g transform="translate(185, 70)">
        <rect x="15" y="30" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="22" y="2" width="14" height="38" rx="7" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <path d="M260 90 L260 50 M254 60 L260 50 L266 60" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    `),
    frame('GOOD (अच्छा)', 3, 3, 'Hold firm thumbs-up at chest', '#22C55E', `
      <g transform="translate(185, 70)">
        <rect x="15" y="30" width="50" height="50" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="22" y="2" width="14" height="38" rx="7" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="220" cy="85" r="65" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Thumb Straight Up</text>
    `)
  ]);

  // 16. STOP (Open Flat Palm Forward)
  await createAnimatedTeachingGif('stop.gif', [
    frame('STOP (रुकिए)', 1, 3, 'Raise open flat hand facing forward', '#EF4444', `
      <g transform="translate(185, 60)">
        <rect x="15" y="45" width="50" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="2.5"/>
        <rect x="18" y="8" width="10" height="40" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="31" y="4" width="10" height="44" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="44" y="7" width="10" height="41" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
        <rect x="57" y="16" width="10" height="32" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">All 5 Fingers Extended</text>
    `),
    frame('STOP (रुकिए)', 2, 3, 'Push palm firmly forward toward camera', '#EF4444', `
      <g transform="translate(180, 55)">
        <rect x="15" y="45" width="60" height="60" rx="12" fill="#FFFFFF" stroke="#18181B" stroke-width="3"/>
        <rect x="18" y="4" width="12" height="44" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="33" y="0" width="12" height="48" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="48" y="3" width="12" height="45" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="63" y="13" width="12" height="35" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="220" cy="95" r="70" stroke="#EF4444" stroke-width="3" stroke-dasharray="6 6"/>
    `),
    frame('STOP (रुकिए)', 3, 3, 'Hold firm flat barrier palm steady', '#EF4444', `
      <g transform="translate(180, 55)">
        <rect x="15" y="45" width="60" height="60" rx="12" fill="#FFFFFF" stroke="#18181B" stroke-width="3"/>
        <rect x="18" y="4" width="12" height="44" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="33" y="0" width="12" height="48" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="48" y="3" width="12" height="45" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
        <rect x="63" y="13" width="12" height="35" rx="6" fill="#FFD15C" stroke="#18181B" stroke-width="2.5"/>
      </g>
      <circle cx="220" cy="95" r="75" stroke="#22C55E" stroke-width="2.5" stroke-dasharray="5 5"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Hold Barrier Palm Steady</text>
    `)
  ]);

  // 17. TIME (Tap Wrist Twice)
  await createAnimatedTeachingGif('time.gif', [
    frame('TIME (समय)', 1, 3, 'Extend non-dominant wrist horizontally', '#38BDF8', `
      <rect x="130" y="110" width="180" height="30" rx="8" fill="#FAF8F5" stroke="#18181B" stroke-width="2.5"/>
      <!-- Watch dial target zone -->
      <circle cx="220" cy="125" r="16" fill="#38BDF8" stroke="#18181B" stroke-width="2"/>
      <g transform="translate(205, 30)">
        <rect x="10" y="25" width="30" height="35" rx="6" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <rect x="18" y="0" width="10" height="28" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="800" fill="#71717A" text-anchor="middle">Index Finger Above Wrist</text>
    `),
    frame('TIME (समय)', 2, 3, 'Tap index finger twice on wrist joint', '#38BDF8', `
      <rect x="130" y="110" width="180" height="30" rx="8" fill="#FAF8F5" stroke="#18181B" stroke-width="2.5"/>
      <circle cx="220" cy="125" r="16" fill="#38BDF8" stroke="#18181B" stroke-width="2"/>
      <g transform="translate(205, 68)">
        <rect x="10" y="25" width="30" height="35" rx="6" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <rect x="18" y="0" width="10" height="28" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <path d="M220 50 L220 70 M214 62 L220 70 L226 62" stroke="#22C55E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="220" y="180" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#0284C7" text-anchor="middle">Tap-Tap on Wrist Dial</text>
    `),
    frame('TIME (समय)', 3, 3, 'Hold finger resting on wrist', '#38BDF8', `
      <rect x="130" y="110" width="180" height="30" rx="8" fill="#FAF8F5" stroke="#18181B" stroke-width="2.5"/>
      <circle cx="220" cy="125" r="16" fill="#38BDF8" stroke="#18181B" stroke-width="2"/>
      <g transform="translate(205, 68)">
        <rect x="10" y="25" width="30" height="35" rx="6" fill="#FFFFFF" stroke="#18181B" stroke-width="2"/>
        <rect x="18" y="0" width="10" height="28" rx="5" fill="#FFD15C" stroke="#18181B" stroke-width="2"/>
      </g>
      <circle cx="220" cy="125" r="45" stroke="#22C55E" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="220" y="185" font-family="system-ui, sans-serif" font-size="12" font-weight="900" fill="#15803D" text-anchor="middle">✓ Double Tap Confirmed</text>
    `)
  ]);

  console.log('All authentic ISL teaching GIFs generated successfully!');
}

generateAll().catch(err => {
  console.error('Error generating GIFs:', err);
  process.exit(1);
});
