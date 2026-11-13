/**
 * Indian Sign Language (ISL) Tailored Pedagogical Curriculum & Progression Path.
 *
 * Defines the structured learner journey: starting with the quintessential Indian greeting (Namaste),
 * building through essential courtesy, two-handed fingerspelling (A-Z), high-priority survival/health,
 * daily kinship/questions, transit/civic essentials, and culminating in expansive 1,000+ word fluency.
 * Grounded in ISLRTC (Indian Sign Language Research and Training Centre) progression standards.
 */

export const ISL_COURSE_LEVELS = Object.freeze([
  {
    id: 'level_1',
    levelNumber: 1,
    title: 'First Touch & Courtesies',
    subtitle: 'Start with Namaste and master core everyday greetings',
    icon: 'Hand',
    badge: 'Foundations',
    accentColor: '#FFD15C',
    startSign: 'NAMASTE',
    description: 'The foundation of Indian Sign Language. Focuses on symmetrical two-handed chest-level postures and core courtesies.',
    glosses: [
      'NAMASTE',
      'HELLO',
      'GOOD_MORNING',
      'GOOD_AFTERNOON',
      'GOOD_EVENING',
      'GOOD_NIGHT',
      'WELCOME',
      'THANK_YOU',
      'PLEASE',
      'SORRY',
      'YES',
      'NO',
      'ME',
      'YOU',
      'GOOD',
      'BAD'
    ]
  },
  {
    id: 'level_2',
    levelNumber: 2,
    title: 'Two-Handed Fingerspelling',
    subtitle: 'Master the authentic 26 ISL alphabet handshapes (A–Z)',
    icon: 'Type',
    badge: 'Alphabet A–Z',
    accentColor: '#38BDF8',
    startSign: 'A',
    description: 'Authentic British/Indian Sign Language two-handed manual alphabet. Used for spelling names, cities, and technical terms.',
    glosses: [
      'A', 'B', 'C', 'D', 'E',
      'F', 'G', 'H', 'I', 'J',
      'K', 'L', 'M', 'N', 'O',
      'P', 'Q', 'R', 'S', 'T',
      'U', 'V', 'W', 'X', 'Y', 'Z'
    ]
  },
  {
    id: 'level_3',
    levelNumber: 3,
    title: 'Survival, Health & Urgency',
    subtitle: 'Critical signs for daily sustenance, medical emergencies and safety',
    icon: 'HeartPulse',
    badge: 'Essential Needs',
    accentColor: '#EF4444',
    startSign: 'HELP',
    description: 'High-priority practical signs needed in daily life, clinics, and unexpected emergency situations.',
    glosses: [
      'HELP',
      'WATER',
      'EAT',
      'DRINK',
      'PAIN',
      'FEVER',
      'DOCTOR',
      'HOSPITAL',
      'MEDICINE',
      'EMERGENCY',
      'AMBULANCE_VAN',
      'BLOOD_DONATION',
      'OXYGEN_CYLINDER',
      'STOP',
      'TIME',
      'CALL',
      'MONEY',
      'WANT'
    ]
  },
  {
    id: 'level_4',
    levelNumber: 4,
    title: 'Family, People & Questions',
    subtitle: 'Introduce family members and ask essential WH-inquiries',
    icon: 'Users',
    badge: 'Social & Questions',
    accentColor: '#A855F7',
    startSign: 'WHAT',
    description: 'Learn the grammatical building blocks of conversations: identifying people and forming inquiries.',
    glosses: [
      'WHAT',
      'WHERE',
      'WHO',
      'WHY',
      'WHEN',
      'HOW',
      'MOTHER',
      'FATHER',
      'BROTHER',
      'SISTER',
      'FAMILY',
      'FRIEND',
      'BABY',
      'NAME',
      'HOME',
      'LOVE',
      'LIKE'
    ]
  },
  {
    id: 'level_5',
    levelNumber: 5,
    title: 'Transit, Commute & Civic India',
    subtitle: 'Navigate Indian streets, metro lines, and civic identification',
    icon: 'Train',
    badge: 'Transit & Civic',
    accentColor: '#F97316',
    startSign: 'AUTO_RICKSHAW',
    description: 'Practical daily vocabulary tailored for living, commuting, and navigating public services in India.',
    glosses: [
      'AUTO_RICKSHAW',
      'BUS_STOP',
      'METRO_TRAIN',
      'RAILWAY_PLATFORM',
      'AIRPORT_TERMINAL',
      'TRAFFIC_SIGNAL',
      'AADHAAR_CARD',
      'UPI_PAYMENT',
      'ONLINE_BANKING',
      'POLICE_STATION',
      'FIRE_BRIGADE',
      'PASSPORT_VISA',
      'VOTER_ID',
      'GOVERNMENT_OFFICE',
      'CLEAN'
    ]
  },
  {
    id: 'level_6',
    levelNumber: 6,
    title: 'Digital World, Work & Inclusion',
    subtitle: 'Technology, assistive devices, and deaf community accessibility',
    icon: 'Laptop',
    badge: 'Tech & Inclusion',
    accentColor: '#22C55E',
    startSign: 'SIGN_LANGUAGE',
    description: 'Modern vocabulary for digital communication, inclusive workplaces, and deaf culture.',
    glosses: [
      'SIGN_LANGUAGE',
      'INTERPRETER',
      'HEARING_AID',
      'SUBTITLES_CAPTION',
      'ACCESSIBILITY',
      'WIFI_ROUTER',
      'SMARTPHONE_APP',
      'VIDEO_CALL',
      'INTERNET_SEARCH',
      'ELECTRICITY_POWER',
      'SOLAR_PANEL',
      'PHARMACY_STORE'
    ]
  },
  {
    id: 'level_7',
    levelNumber: 7,
    title: 'The 1,000+ Conversational Lexicon',
    subtitle: 'Expansive vocabulary across 11 daily domains for full fluency',
    icon: 'Globe',
    badge: 'Full Fluency',
    accentColor: '#EC4899',
    startSign: 'TRY_ATTEMPT',
    description: 'Dive into all 1,025 vocabulary signs organized across 11 thematic domains.',
    isLexiconLevel: true,
    glosses: [] // Dynamically covers all remaining signs in ISL_WORD_LABELS
  }
]);

/**
 * Sequential order of all core curriculum signs (Levels 1 through 6)
 */
export const CORE_PATH_GLOSSES = Object.freeze(
  ISL_COURSE_LEVELS.filter(lvl => !lvl.isLexiconLevel).flatMap(lvl => lvl.glosses)
);

/**
 * Fast lookup for which level a gloss belongs to
 */
const GLOSS_TO_LEVEL_MAP = new Map();
for (const lvl of ISL_COURSE_LEVELS) {
  for (const g of lvl.glosses) {
    GLOSS_TO_LEVEL_MAP.set(g.toUpperCase().replace(/\s+/g, '_'), lvl);
  }
}

export function getLevelForGloss(gloss) {
  if (!gloss) return ISL_COURSE_LEVELS[0];
  const cleaned = gloss.toUpperCase().replace(/\s+/g, '_');
  return GLOSS_TO_LEVEL_MAP.get(cleaned) || ISL_COURSE_LEVELS[6]; // Level 7 is default for general lexicon
}

/**
 * Determine the next recommended sign along the tailored course path
 */
export function getNextRecommendedSign(currentGloss, masteredSet = new Set(), allItems = []) {
  const normCurrent = currentGloss ? currentGloss.toUpperCase().replace(/\s+/g, '_') : null;

  const isMastered = (candidate) => {
    if (masteredSet.has(candidate) || masteredSet.has(candidate.replace(/_/g, ' '))) {
      return true;
    }
    if ((candidate === 'ME' || candidate === 'I_ME') && (masteredSet.has('ME') || masteredSet.has('I_ME'))) {
      return true;
    }
    return false;
  };

  const currentIdx = normCurrent ? CORE_PATH_GLOSSES.indexOf(normCurrent) : -1;
  const searchStart = currentIdx >= 0 ? currentIdx + 1 : 0;

  // 1. Look ahead along the structured path for the first unmastered sign
  for (let i = searchStart; i < CORE_PATH_GLOSSES.length; i++) {
    const candidate = CORE_PATH_GLOSSES[i];
    if (candidate !== normCurrent && !isMastered(candidate)) {
      return candidate;
    }
  }

  // 2. If all signs past current are mastered, check from beginning of path
  const searchEnd = currentIdx >= 0 ? currentIdx : CORE_PATH_GLOSSES.length;
  for (let i = 0; i < searchEnd; i++) {
    const candidate = CORE_PATH_GLOSSES[i];
    if (candidate !== normCurrent && !isMastered(candidate)) {
      return candidate;
    }
  }

  // 3. Fallback: if all core path is mastered, pick next from all items
  const unmastered = allItems.find(item => item.label && item.label.toUpperCase().replace(/\s+/g, '_') !== normCurrent && !isMastered(item.label));
  if (unmastered) {
    return unmastered.label;
  }

  // 4. If everything is mastered, cycle forward to the next sign in the core path
  if (currentIdx >= 0) {
    return CORE_PATH_GLOSSES[(currentIdx + 1) % CORE_PATH_GLOSSES.length];
  }
  return CORE_PATH_GLOSSES[0];
}

/**
 * Calculate progress statistics for the tailored course
 */
export function calculateCourseProgress(masteredSet = new Set()) {
  const levelStats = ISL_COURSE_LEVELS.map(lvl => {
    if (lvl.isLexiconLevel) {
      return {
        levelId: lvl.id,
        levelNumber: lvl.levelNumber,
        title: lvl.title,
        total: 1025,
        mastered: masteredSet.size,
        pct: Math.min(100, Math.round((masteredSet.size / 1025) * 100))
      };
    }

    const total = lvl.glosses.length;
    let mastered = 0;
    for (const g of lvl.glosses) {
      if (masteredSet.has(g) || masteredSet.has(g.replace(/_/g, ' '))) {
        mastered++;
      }
    }

    return {
      levelId: lvl.id,
      levelNumber: lvl.levelNumber,
      title: lvl.title,
      total,
      mastered,
      pct: total > 0 ? Math.round((mastered / total) * 100) : 0
    };
  });

  const coreTotal = CORE_PATH_GLOSSES.length;
  let coreMastered = 0;
  for (const g of CORE_PATH_GLOSSES) {
    if (masteredSet.has(g) || masteredSet.has(g.replace(/_/g, ' '))) {
      coreMastered++;
    }
  }

  return {
    coreTotal,
    coreMastered,
    corePct: coreTotal > 0 ? Math.round((coreMastered / coreTotal) * 100) : 0,
    totalMastered: masteredSet.size,
    levelStats
  };
}
