import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const signsDir = path.resolve(__dirname, '../public/signs');

const signsToGenerate = [
  {
    id: 'eat',
    title: 'EAT',
    subtitle: 'Pinched tips to mouth',
    iconBg: '#FEF08A',
    svgGraphic: `
      <g transform="translate(140, 110)">
        <!-- Face profile / chin outline -->
        <path d="M120 40 C100 40 85 55 85 75 C85 95 100 110 120 110" stroke="#18181B" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- Lips -->
        <path d="M85 75 C75 75 70 80 65 80" stroke="#EF4444" stroke-width="6" stroke-linecap="round"/>
        <!-- Hand bringing pinched fingers to mouth -->
        <path d="M10 100 C20 70 45 65 58 75 C52 85 40 95 20 120 Z" fill="#FFD15C" stroke="#18181B" stroke-width="5" stroke-linejoin="round"/>
        <!-- Motion arrows toward lips -->
        <path d="M30 60 L50 70 M45 62 L52 70 L42 75" stroke="#22C55E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `
  },
  {
    id: 'you',
    title: 'YOU',
    subtitle: 'Index pointing forward',
    iconBg: '#BAE6FD',
    svgGraphic: `
      <g transform="translate(130, 120)">
        <!-- Hand pointing outward towards viewer -->
        <rect x="30" y="50" width="80" height="70" rx="16" fill="#FFD15C" stroke="#18181B" stroke-width="5"/>
        <!-- Forefinger extended forward -->
        <path d="M60 50 L60 0 C60 -10 80 -10 80 0 L80 50 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="5"/>
        <line x1="70" y1="5" x2="70" y2="45" stroke="#18181B" stroke-width="3" stroke-linecap="round"/>
        <!-- Arrow pointing directly forward -->
        <path d="M70 -15 L70 -35 M62 -27 L70 -35 L78 -27" stroke="#38BDF8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `
  },
  {
    id: 'me',
    title: 'ME / I',
    subtitle: 'Index pointing to chest',
    iconBg: '#FED7AA',
    svgGraphic: `
      <g transform="translate(130, 120)">
        <!-- Chest outline -->
        <path d="M10 120 C40 80 100 80 130 120" stroke="#94A3B8" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- Hand pointing back at chest center -->
        <rect x="25" y="30" width="75" height="65" rx="14" fill="#FFD15C" stroke="#18181B" stroke-width="5"/>
        <!-- Index pointing inward/down at chest -->
        <path d="M60 95 L60 140 C60 148 78 148 78 140 L78 95 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="5"/>
        <!-- Target bullseye at chest -->
        <circle cx="69" cy="155" r="8" fill="#EF4444" stroke="#18181B" stroke-width="3"/>
      </g>
    `
  },
  {
    id: 'welcome',
    title: 'WELCOME',
    subtitle: 'Both palms sweep inward',
    iconBg: '#BBF7D0',
    svgGraphic: `
      <g transform="translate(100, 110)">
        <!-- Left welcoming open palm -->
        <path d="M30 110 C20 70 30 30 50 20 C60 25 55 60 50 110 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="5" stroke-linejoin="round"/>
        <!-- Right welcoming open palm -->
        <path d="M170 110 C180 70 170 30 150 20 C140 25 145 60 150 110 Z" fill="#FFD15C" stroke="#18181B" stroke-width="5" stroke-linejoin="round"/>
        <!-- Inward sweeping gesture arrows -->
        <path d="M55 50 C80 60 95 80 95 80 M85 75 L95 80 L96 70" stroke="#22C55E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M145 50 C120 60 105 80 105 80 M115 75 L105 80 L104 70" stroke="#22C55E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `
  },
  {
    id: 'pain',
    title: 'PAIN',
    subtitle: 'Index fingers pointing together',
    iconBg: '#FECDD3',
    svgGraphic: `
      <g transform="translate(100, 120)">
        <!-- Left index pointing right -->
        <path d="M20 75 L75 75 C82 75 82 60 75 60 L20 60 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="5"/>
        <rect x="0" y="50" width="30" height="35" rx="8" fill="#FFFFFF" stroke="#18181B" stroke-width="5"/>
        <!-- Right index pointing left -->
        <path d="M180 75 L125 75 C118 75 118 60 125 60 L180 60 Z" fill="#FFD15C" stroke="#18181B" stroke-width="5"/>
        <rect x="170" y="50" width="30" height="35" rx="8" fill="#FFD15C" stroke="#18181B" stroke-width="5"/>
        <!-- Pain spark pulse at center -->
        <path d="M100 50 L105 62 L115 67 L105 72 L100 84 L95 72 L85 67 L95 62 Z" fill="#EF4444" stroke="#18181B" stroke-width="3"/>
      </g>
    `
  },
  {
    id: 'fever',
    title: 'FEVER',
    subtitle: 'Back of hand on forehead',
    iconBg: '#FDE68A',
    svgGraphic: `
      <g transform="translate(130, 100)">
        <!-- Forehead / Face contour -->
        <path d="M50 30 C75 20 105 20 120 40 C125 55 120 80 100 110" stroke="#18181B" stroke-width="5" fill="none" stroke-linecap="round"/>
        <!-- Palm touching forehead checking temperature -->
        <rect x="15" y="30" width="70" height="40" rx="12" fill="#FFD15C" stroke="#18181B" stroke-width="5" transform="rotate(-15, 50, 50)"/>
        <!-- Heat thermometer rays -->
        <path d="M90 15 L95 5 M110 20 L120 12 M70 15 L65 5" stroke="#F97316" stroke-width="4" stroke-linecap="round"/>
      </g>
    `
  },
  {
    id: 'want',
    title: 'WANT',
    subtitle: 'Both hands pull inward',
    iconBg: '#DDD6FE',
    svgGraphic: `
      <g transform="translate(110, 110)">
        <!-- Left claw hand pulling in -->
        <path d="M30 60 C35 40 50 35 60 50 C55 65 45 75 35 75 Z" fill="#FFFFFF" stroke="#18181B" stroke-width="5"/>
        <rect x="10" y="55" width="40" height="40" rx="10" fill="#FFFFFF" stroke="#18181B" stroke-width="5"/>
        <!-- Right claw hand pulling in -->
        <path d="M150 60 C145 40 130 35 120 50 C125 65 135 75 145 75 Z" fill="#FFD15C" stroke="#18181B" stroke-width="5"/>
        <rect x="130" y="55" width="40" height="40" rx="10" fill="#FFD15C" stroke="#18181B" stroke-width="5"/>
        <!-- Inward pull arrows -->
        <path d="M30 110 L55 110 M48 103 L55 110 L48 117" stroke="#8B5CF6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M150 110 L125 110 M132 103 L125 110 L132 117" stroke="#8B5CF6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    `
  }
];

async function run() {
  for (const item of signsToGenerate) {
    const filePath = path.join(signsDir, `${item.id}.jpg`);
    // Create clean 400x400 vector card SVG
    const svg = `
      <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#FAF8F5"/>
        <rect x="16" y="16" width="368" height="368" rx="28" fill="#FFFFFF" stroke="#18181B" stroke-width="6"/>
        <!-- Badge Header -->
        <rect x="36" y="36" width="328" height="54" rx="14" fill="${item.iconBg}" stroke="#18181B" stroke-width="4"/>
        <text x="200" y="72" font-size="26" font-family="system-ui, -apple-system, sans-serif" font-weight="900" text-anchor="middle" fill="#18181B" letter-spacing="1.5">${item.title}</text>
        <!-- Center Graphic -->
        ${item.svgGraphic}
        <!-- Footer Subtitle -->
        <rect x="40" y="322" width="320" height="40" rx="10" fill="#F4F4F5" stroke="#E4E4E7" stroke-width="2"/>
        <text x="200" y="348" font-size="16" font-family="system-ui, -apple-system, sans-serif" font-weight="700" text-anchor="middle" fill="#52525B">${item.subtitle}</text>
      </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 95 })
      .toFile(filePath);
    console.log(`Generated ${filePath}`);
  }
}

run().catch(err => {
  console.error('Failed to generate sign images:', err);
  process.exit(1);
});
