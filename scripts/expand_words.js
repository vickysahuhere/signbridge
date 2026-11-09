import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordLabelsPath = path.resolve(__dirname, '../src/ai/islWordLabels.js');
let content = fs.readFileSync(wordLabelsPath, 'utf8');

const newWords = [
  {
    id: 1000,
    gloss: 'METRO_TRAIN',
    english: 'Metro Train',
    category: 'transit',
    description: 'Both index fingers point forward and glide smoothly along parallel invisible tracks.'
  },
  {
    id: 1001,
    gloss: 'RAILWAY_PLATFORM',
    english: 'Railway Platform',
    category: 'transit',
    description: 'Flat non-dominant palm forms platform surface while dominant V-fingers stand waiting.'
  },
  {
    id: 1002,
    gloss: 'AIRPORT_TERMINAL',
    english: 'Airport Terminal',
    category: 'transit',
    description: 'Y-airplane handshape takes off smoothly rising diagonally into the air.'
  },
  {
    id: 1003,
    gloss: 'ONLINE_BANKING',
    english: 'Online Banking',
    category: 'essentials',
    description: 'Fingertips tap rapid digital keypad on open palm followed by coin exchange motion.'
  },
  {
    id: 1004,
    gloss: 'POLICE_STATION',
    english: 'Police Station',
    category: 'essentials',
    description: 'Dominant hand gives sharp salute at temple followed by hands outlining building walls.'
  },
  {
    id: 1005,
    gloss: 'FIRE_BRIGADE',
    english: 'Fire Brigade',
    category: 'essentials',
    description: 'Both hands grip heavy imaginary fire hose sweeping strong water stream outward.'
  },
  {
    id: 1006,
    gloss: 'AMBULANCE_VAN',
    english: 'Ambulance',
    category: 'healthcare',
    description: 'Dominant cupped hand rotates atop head imitating revolving emergency beacon light.'
  },
  {
    id: 1007,
    gloss: 'OXYGEN_CYLINDER',
    english: 'Oxygen Cylinder',
    category: 'healthcare',
    description: 'Cupped hand covers nose and mouth inhaling deeply, then hands outline cylindrical tank.'
  },
  {
    id: 1008,
    gloss: 'BLOOD_DONATION',
    english: 'Blood Donation',
    category: 'healthcare',
    description: 'Fist clenches at inner elbow vein followed by open palms extending generous offering forward.'
  },
  {
    id: 1009,
    gloss: 'PHARMACY_STORE',
    english: 'Pharmacy / Chemist',
    category: 'healthcare',
    description: 'Dominant thumb grinds mortar in cupped palm followed by medicine pill gesture.'
  },
  {
    id: 1010,
    gloss: 'WIFI_ROUTER',
    english: 'Wi-Fi Router',
    category: 'education_work',
    description: 'Arched fingers pulse outward in radiating electromagnetic wave arcs.'
  },
  {
    id: 1011,
    gloss: 'SMARTPHONE_APP',
    english: 'Smartphone App',
    category: 'education_work',
    description: 'Thumb swipes vertically across flat palm and decisively taps square app icon.'
  },
  {
    id: 1012,
    gloss: 'VIDEO_CALL',
    english: 'Video Call',
    category: 'education_work',
    description: 'C-hands frame face looking into camera beam connecting directly to remote screen.'
  },
  {
    id: 1013,
    gloss: 'INTERNET_SEARCH',
    english: 'Internet Search',
    category: 'education_work',
    description: 'Dominant C-hand acts as magnifying lens scanning across open informative palm.'
  },
  {
    id: 1014,
    gloss: 'ELECTRICITY_POWER',
    english: 'Electricity / Power',
    category: 'essentials',
    description: 'Bent index fingers snap together emitting rapid energetic spark of high voltage.'
  },
  {
    id: 1015,
    gloss: 'SOLAR_PANEL',
    english: 'Solar Panel',
    category: 'essentials',
    description: 'Circular sun traced overhead followed by both flat hands tilted toward sky in grid array.'
  },
  {
    id: 1016,
    gloss: 'TRAFFIC_SIGNAL',
    english: 'Traffic Signal',
    category: 'transit',
    description: 'Three fingers tap downward in sequence indicating red, yellow, and green traffic lights.'
  },
  {
    id: 1017,
    gloss: 'GOVERNMENT_OFFICE',
    english: 'Government Office',
    category: 'education_work',
    description: 'Three-finger Ashoka pillar salute held proudly at temple followed by office building shape.'
  },
  {
    id: 1018,
    gloss: 'PASSPORT_VISA',
    english: 'Passport / Visa',
    category: 'transit',
    description: 'Both hands open small booklet and dominant fist presses firm official visa stamp.'
  },
  {
    id: 1019,
    gloss: 'VOTER_ID',
    english: 'Voter ID Card',
    category: 'essentials',
    description: 'Dominant upright index finger displays dark indelible voting ink mark.'
  },
  {
    id: 1020,
    gloss: 'SIGN_LANGUAGE',
    english: 'Sign Language',
    category: 'education_work',
    description: 'Both open 5-hands rotate gracefully around each other expressing fluent signing hands.'
  },
  {
    id: 1021,
    gloss: 'INTERPRETER',
    english: 'Sign Interpreter',
    category: 'education_work',
    description: 'F-hands touch at index fingertips and twist alternately communicating between two worlds.'
  },
  {
    id: 1022,
    gloss: 'HEARING_AID',
    english: 'Hearing Aid / Cochlear',
    category: 'healthcare',
    description: 'Bent index finger curls snugly over and behind the ear indicating ear-level assistive device.'
  },
  {
    id: 1023,
    gloss: 'SUBTITLES_CAPTION',
    english: 'Subtitles / Captions',
    category: 'education_work',
    description: 'Both index and middle fingers sweep horizontally below chin displaying text stream.'
  },
  {
    id: 1024,
    gloss: 'ACCESSIBILITY',
    english: 'Accessibility / Inclusion',
    category: 'education_work',
    description: 'Both arms extend wide outward in an embracing circle of universal barrier-free access.'
  }
];

const targetClosing = '\n]);\n\nexport const TIER_1_WORD_COUNT';
const insertBlock = ',\n' + newWords.map(item => `  {
    id: ${item.id},
    gloss: ${JSON.stringify(item.gloss)},
    english: ${JSON.stringify(item.english)},
    category: ${JSON.stringify(item.category)},
    description: ${JSON.stringify(item.description)}
  }`).join(',\n') + '\n]);\n\nexport const TIER_1_WORD_COUNT';

content = content.replace(targetClosing, insertBlock);
fs.writeFileSync(wordLabelsPath, content);
console.log('Successfully expanded words to 1,025 in islWordLabels.js');
