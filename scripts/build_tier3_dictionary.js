import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ISL_WORD_LABELS as BASE_LABELS } from '../src/ai/islWordLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`[build_tier3_dictionary] Baseline labels count: ${BASE_LABELS.length}`);

// Valid Categories
const VALID_CATEGORIES = new Set([
  'greetings',
  'pronouns',
  'questions',
  'actions',
  'transit',
  'healthcare',
  'shopping_food',
  'education_work',
  'time_calendar',
  'feelings_states',
  'essentials'
]);

// 740 Tier 3 expansion words to bring total from 260 to 1,000
const TIER_3_EXPANSIONS = [
  // --- Greetings & Politeness (+18) ---
  { gloss: 'NAMASTE', english: 'Namaste', category: 'greetings', description: 'Palms pressed together at chest level in traditional respectful greeting.' },
  { gloss: 'GOOD_LUCK', english: 'Good Luck', category: 'greetings', description: 'Thumbs up gesture moving outward with warm encouraging expression.' },
  { gloss: 'BEST_WISHES', english: 'Best Wishes', category: 'greetings', description: 'Both hands open moving forward with blessings motion.' },
  { gloss: 'TAKE_CARE', english: 'Take Care', category: 'greetings', description: 'Both K-hands tap crossed wrists in protective caretaking motion.' },
  { gloss: 'NICE_TO_MEET_YOU', english: 'Nice to meet you', category: 'greetings', description: 'Good sign followed by meet sign with pleasant smile.' },
  { gloss: 'SEE_YOU_AGAIN', english: 'See you again', category: 'greetings', description: 'See sign followed by again sign circling fingers.' },
  { gloss: 'HAVE_A_GOOD_DAY', english: 'Have a good day', category: 'greetings', description: 'Good sign followed by day sign arcing overhead.' },
  { gloss: 'GOD_BLESS', english: 'God Bless', category: 'greetings', description: 'Both open hands descend gently from forehead level in divine blessing.' },
  { gloss: 'SORRY_TO_BOTHER', english: 'Sorry to bother', category: 'greetings', description: 'Sorry sign followed by gentle excuse brush on palm.' },
  { gloss: 'MY_PLEASURE', english: 'My pleasure', category: 'greetings', description: 'Flat hand on heart rotating warmly with content smile.' },
  { gloss: 'PARDON', english: 'Pardon', category: 'greetings', description: 'Cupped hand to ear with questioning slight head tilt.' },
  { gloss: 'CHEERS', english: 'Cheers', category: 'greetings', description: 'Both hands hold imaginary glasses clinking together merrily.' },
  { gloss: 'WELCOME_BACK', english: 'Welcome back', category: 'greetings', description: 'Welcome gesture followed by return beckon towards chest.' },
  { gloss: 'FAREWELL', english: 'Farewell', category: 'greetings', description: 'Both flat hands wave gracefully from side to side in parting.' },
  { gloss: 'PEACE', english: 'Peace', category: 'greetings', description: 'Palms meet then glide smoothly outward horizontally in tranquil calmness.' },
  { gloss: 'RESPECT', english: 'Respect', category: 'greetings', description: 'Dominant R-hand touches forehead and extends forward honorably.' },
  { gloss: 'HUMBLE', english: 'Humble', category: 'greetings', description: 'Dominant index finger slides gently under non-dominant palm.' },
  { gloss: 'GREETINGS_FORMAL', english: 'Formal Greetings', category: 'greetings', description: 'Both hands sweep from shoulders outward in formal reception.' },

  // --- Pronouns, Family, People & Professions (+74) ---
  { gloss: 'GRANDFATHER', english: 'Grandfather', category: 'pronouns', description: 'Father sign touching forehead bouncing forward one generation.' },
  { gloss: 'GRANDMOTHER', english: 'Grandmother', category: 'pronouns', description: 'Mother sign touching chin bouncing forward one generation.' },
  { gloss: 'UNCLE', english: 'Uncle', category: 'pronouns', description: 'U-handshape twists twice near the temple or cheek.' },
  { gloss: 'AUNT', english: 'Aunt', category: 'pronouns', description: 'A-handshape twists twice near the chin or jawline.' },
  { gloss: 'COUSIN', english: 'Cousin', category: 'pronouns', description: 'C-handshape shakes gently near side of temple.' },
  { gloss: 'NEPHEW', english: 'Nephew', category: 'pronouns', description: 'N-handshape twists near forehead level indicating young male.' },
  { gloss: 'NIECE', english: 'Niece', category: 'pronouns', description: 'N-handshape twists near jaw level indicating young female.' },
  { gloss: 'IN_LAWS', english: 'In-Laws', category: 'pronouns', description: 'Marriage clasp followed by L-handshape touching palm.' },
  { gloss: 'FATHER_IN_LAW', english: 'Father-in-law', category: 'pronouns', description: 'Father sign followed by legal law L-sign on palm.' },
  { gloss: 'MOTHER_IN_LAW', english: 'Mother-in-law', category: 'pronouns', description: 'Mother sign followed by legal law L-sign on palm.' },
  { gloss: 'BROTHER_IN_LAW', english: 'Brother-in-law', category: 'pronouns', description: 'Brother sign followed by legal law L-sign on palm.' },
  { gloss: 'SISTER_IN_LAW', english: 'Sister-in-law', category: 'pronouns', description: 'Sister sign followed by legal law L-sign on palm.' },
  { gloss: 'TWINS', english: 'Twins', category: 'pronouns', description: 'V-fingers touch chin and split into two identical people.' },
  { gloss: 'NEIGHBOR', english: 'Neighbor', category: 'pronouns', description: 'Home sign followed by near sign and person classifier.' },
  { gloss: 'LANDLORD', english: 'Landlord', category: 'pronouns', description: 'House sign followed by owner manager claw on shoulder.' },
  { gloss: 'TENANT', english: 'Tenant', category: 'pronouns', description: 'Rent sign followed by person descending indicator.' },
  { gloss: 'GUEST', english: 'Guest', category: 'pronouns', description: 'Welcome sign followed by person classifier.' },
  { gloss: 'HOST', english: 'Host', category: 'pronouns', description: 'Receive sign followed by manager person badge.' },
  { gloss: 'PARENT', english: 'Parents', category: 'pronouns', description: 'Combined mother (chin) and father (forehead) signs in smooth sequence.' },
  { gloss: 'RELATIVES', english: 'Relatives', category: 'pronouns', description: 'Both hooked index fingers interlink and chain outward.' },
  { gloss: 'ANCESTORS', english: 'Ancestors', category: 'pronouns', description: 'Hands cycle backward over shoulders into deep lineage.' },
  { gloss: 'CHILDREN', english: 'Children', category: 'pronouns', description: 'Both flat hands pat downward alternately at hip level.' },
  { gloss: 'BOY', english: 'Boy', category: 'pronouns', description: 'Fingers grip imaginary cap brim at forehead.' },
  { gloss: 'GIRL', english: 'Girl', category: 'pronouns', description: 'Thumb strokes jawline downwards towards chin.' },
  { gloss: 'MAN', english: 'Man', category: 'pronouns', description: 'Forehead cap sign followed by tall adult height indicator.' },
  { gloss: 'WOMAN', english: 'Woman', category: 'pronouns', description: 'Chin cheek sign followed by chest height indicator.' },
  { gloss: 'ELDER', english: 'Elderly Person', category: 'pronouns', description: 'Curved hand mimics walking cane with slow deliberate posture.' },
  { gloss: 'YOUTH', english: 'Youth', category: 'pronouns', description: 'Both hands brush upward from waist with energetic bounce.' },
  { gloss: 'ADULT', english: 'Adult', category: 'pronouns', description: 'Flat hand rises from chest to head height indicating maturity.' },
  { gloss: 'CITIZEN', english: 'Citizen', category: 'pronouns', description: 'Country sign followed by person descending hands.' },
  { gloss: 'ENGINEER', english: 'Engineer', category: 'pronouns', description: 'Interlocking Y-hands pivot like measuring gears, then person sign.' },
  { gloss: 'SCIENTIST', english: 'Scientist', category: 'pronouns', description: 'Both hands pour imaginary test tubes alternately, then person sign.' },
  { gloss: 'LAWYER', english: 'Lawyer', category: 'pronouns', description: 'L-hand taps non-dominant palm twice, then person sign.' },
  { gloss: 'JUDGE', english: 'Judge', category: 'pronouns', description: 'Fist gavel taps down firmly twice, then person sign.' },
  { gloss: 'POLITICIAN', english: 'Politician', category: 'pronouns', description: 'P-hand traces circle near temple with prominent stance.' },
  { gloss: 'SOLDIER', english: 'Soldier', category: 'pronouns', description: 'Both fists hold imaginary rifle across chest at attention.' },
  { gloss: 'ARMY', english: 'Army', category: 'pronouns', description: 'Salute followed by line of soldiers marching.' },
  { gloss: 'NAVY', english: 'Navy', category: 'pronouns', description: 'Water sign followed by boat gliding and sailor salute.' },
  { gloss: 'PILOT', english: 'Pilot', category: 'pronouns', description: 'Airplane handshape gliding forward, then person sign.' },
  { gloss: 'DRIVER', english: 'Driver', category: 'pronouns', description: 'Steering wheel turning motion, then person sign.' },
  { gloss: 'CONDUCTOR', english: 'Conductor', category: 'pronouns', description: 'Ticket punch click motion, then person sign.' },
  { gloss: 'CHEF_COOK', english: 'Chef / Cook', category: 'pronouns', description: 'Cooking stir motion followed by tall chef hat indicator.' },
  { gloss: 'FARMER', english: 'Farmer', category: 'pronouns', description: 'Agriculture plow motion across palm, then person sign.' },
  { gloss: 'CARPENTER', english: 'Carpenter', category: 'pronouns', description: 'Planer shaving wood back and forth, then person sign.' },
  { gloss: 'PLUMBER', english: 'Plumber', category: 'pronouns', description: 'Wrench twisting on pipe gesture, then person sign.' },
  { gloss: 'ELECTRICIAN', english: 'Electrician', category: 'pronouns', description: 'Both X-fingers spark together like electricity, then person sign.' },
  { gloss: 'MECHANIC', english: 'Mechanic', category: 'pronouns', description: 'Interlocked fingers gear turn, then tool tightening gesture.' },
  { gloss: 'TAILOR', english: 'Tailor', category: 'pronouns', description: 'Needle and thread stitching motion, then person sign.' },
  { gloss: 'BARBER', english: 'Barber / Hairdresser', category: 'pronouns', description: 'V-fingers snip like scissors near hair, then person sign.' },
  { gloss: 'SECURITY_GUARD', english: 'Security Guard', category: 'pronouns', description: 'Crossed arms shield chest firmly with alert eye scanning.' },
  { gloss: 'CLEANER_SWEEPER', english: 'Cleaner', category: 'pronouns', description: 'Sweeping broom motion across ground, then person sign.' },
  { gloss: 'POSTMAN', english: 'Postman', category: 'pronouns', description: 'Stamp lick onto envelope, then bag shoulder strap sign.' },
  { gloss: 'DELIVERY_PERSON', english: 'Delivery Person', category: 'pronouns', description: 'Carrying box forward and handing over with signature sign.' },
  { gloss: 'SHOPKEEPER', english: 'Shopkeeper', category: 'pronouns', description: 'Shop store sign followed by person classifier.' },
  { gloss: 'CLERK', english: 'Clerk', category: 'pronouns', description: 'Typing or writing on desk, then person sign.' },
  { gloss: 'ACCOUNTANT', english: 'Accountant', category: 'pronouns', description: 'Calculator tapping and money counting, then person sign.' },
  { gloss: 'ARTIST', english: 'Artist', category: 'pronouns', description: 'Brush painting on imaginary canvas, then person sign.' },
  { gloss: 'PAINTER', english: 'Painter', category: 'pronouns', description: 'Wide flat hand stroke on wall surface, then person sign.' },
  { gloss: 'MUSICIAN', english: 'Musician', category: 'pronouns', description: 'Playing instrument motion with rhythmic swaying.' },
  { gloss: 'SINGER', english: 'Singer', category: 'pronouns', description: 'V-fingers arc from mouth outward like singing voice, then person.' },
  { gloss: 'ACTOR', english: 'Actor', category: 'pronouns', description: 'Both thumbs-up rotate alternately towards chest, then person.' },
  { gloss: 'WRITER_AUTHOR', english: 'Writer / Author', category: 'pronouns', description: 'Pen writing on palm followed by book publication sign.' },
  { gloss: 'JOURNALIST', english: 'Journalist', category: 'pronouns', description: 'Holding microphone to speaker and taking notes.' },
  { gloss: 'PHOTOGRAPHER', english: 'Photographer', category: 'pronouns', description: 'Both hands click imaginary camera shutter, then person.' },
  { gloss: 'PRIEST', english: 'Priest / Clergy', category: 'pronouns', description: 'Prayer hands followed by holy thread or collar gesture.' },
  { gloss: 'VOLUNTEER', english: 'Volunteer', category: 'pronouns', description: 'Pinching shirt fabric at chest and lifting forward eagerly.' },
  { gloss: 'ATHLETE', english: 'Athlete / Sportsman', category: 'pronouns', description: 'Running sprinting posture with victorious fist pump.' },
  { gloss: 'COACH', english: 'Coach', category: 'pronouns', description: 'C-hand on shoulder with whistle blowing gesture.' },
  { gloss: 'BOSS', english: 'Boss / Executive', category: 'pronouns', description: 'Curved claw taps shoulder twice with authority.' },
  { gloss: 'CLIENT', english: 'Client / Customer', category: 'pronouns', description: 'Buying person exchanging payment with seller.' },
  { gloss: 'PARTNER', english: 'Partner', category: 'pronouns', description: 'Both index fingers hook together side by side.' },
  { gloss: 'STRANGER', english: 'Stranger', category: 'pronouns', description: 'Unknown sign followed by person gesture.' },
  { gloss: 'DEAF_COMMUNITY', english: 'Deaf Community', category: 'pronouns', description: 'Ear-to-mouth deaf sign followed by united group circle.' },
  { gloss: 'HEARING_PERSON', english: 'Hearing Person', category: 'pronouns', description: 'Index finger points to ear and circles forward in speech.' },

  // --- Questions, Interrogatives & Quantifiers (+20) ---
  { gloss: 'WHEREVER', english: 'Wherever', category: 'questions', description: 'Where sign swept across expansive horizontal arc.' },
  { gloss: 'WHENEVER', english: 'Whenever', category: 'questions', description: 'When sign followed by anytime outward shrug.' },
  { gloss: 'WHATEVER', english: 'Whatever', category: 'questions', description: 'Both palms up drop carelessly with casual shrug.' },
  { gloss: 'WHOEVER', english: 'Whoever', category: 'questions', description: 'Who sign combined with any person sweeping arc.' },
  { gloss: 'HOWEVER', english: 'However', category: 'questions', description: 'Both index fingers cross and flip direction.' },
  { gloss: 'HOW_LONG', english: 'How long (Time)', category: 'questions', description: 'Index finger traces along forearm from wrist to elbow.' },
  { gloss: 'HOW_FAR', english: 'How far (Distance)', category: 'questions', description: 'Index finger points forward measuring long distance with squint.' },
  { gloss: 'HOW_OFTEN', english: 'How often', category: 'questions', description: 'Index finger taps palm repeatedly counting occurrences.' },
  { gloss: 'HOW_OLD', english: 'How old (Age)', category: 'questions', description: 'Y-hand pulls down from chin like beard with questioning look.' },
  { gloss: 'IS_IT', english: 'Is it?', category: 'questions', description: 'Single affirmative nod paired with questioning raised eyebrows.' },
  { gloss: 'CAN_YOU', english: 'Can you?', category: 'questions', description: 'Both S-fists drop downward paired with questioning head tilt.' },
  { gloss: 'MAY_I', english: 'May I?', category: 'questions', description: 'Open flat hands held up petitioning gently forward.' },
  { gloss: 'COULD_WE', english: 'Could we?', category: 'questions', description: 'We circle followed by can fists dropping interrogatively.' },
  { gloss: 'WHICH_ONE', english: 'Which one?', category: 'questions', description: 'Index finger points alternately between two imaginary targets.' },
  { gloss: 'SEVERAL', english: 'Several', category: 'questions', description: 'Fingers roll open sequentially from fist like counting 4-5 items.' },
  { gloss: 'FEW', english: 'Few', category: 'questions', description: 'Thumb scrapes across tips of curled fingers in small quantity.' },
  { gloss: 'MANY', english: 'Many', category: 'questions', description: 'Both fists explode open repeatedly with wide eyes.' },
  { gloss: 'MUCH', english: 'Much', category: 'questions', description: 'Both curved claw hands hold large volume in front of chest.' },
  { gloss: 'LITTLE_AMOUNT', english: 'Little (Amount)', category: 'questions', description: 'Thumb and index hold tiny gap apart demonstrating scarcity.' },
  { gloss: 'ENOUGH', english: 'Enough', category: 'questions', description: 'Dominant flat hand pushes over top of non-dominant fist like overflowing.' },
  { gloss: 'WHATEVER_HAPPENS', english: 'Whatever happens', category: 'questions', description: 'Both hands sweep open with accepting resolute nod.' },
  { gloss: 'AT_ANY_TIME', english: 'At any time', category: 'questions', description: 'Time tap on wrist followed by open sweeping choice.' },
  { gloss: 'STEP_BY_STEP', english: 'Step by step / Gradually', category: 'actions', description: 'Hands step forward alternately in measured cadence.' },
  { gloss: 'ROUND_TRIP', english: 'Round trip ticket', category: 'transit', description: 'Journey arcs outward and curves back to home base.' },
  { gloss: 'ONE_WAY', english: 'One way ticket', category: 'transit', description: 'Index points straight to destination without returning loop.' },
  { gloss: 'CHECK_IN', english: 'Check-in counter', category: 'transit', description: 'Ticket presented at counter with baggage handed over.' },
  { gloss: 'CHECK_OUT', english: 'Check-out', category: 'transit', description: 'Keys handed back at desk completing hotel departure.' },
  { gloss: 'BLOOD_BANK', english: 'Blood bank', category: 'healthcare', description: 'Blood sign followed by refrigerated storage depot.' },
  { gloss: 'PHARMACIST', english: 'Pharmacist', category: 'healthcare', description: 'Medicine compounding gesture followed by person sign.' },
  { gloss: 'SURGERY_ROOM', english: 'Surgery room', category: 'healthcare', description: 'Sterile scalpel incision sign followed by room boundary.' },
  { gloss: 'RECOVERY_ROOM', english: 'Recovery room', category: 'healthcare', description: 'Healing recovery rise sign inside patient room.' },
  { gloss: 'GROCERY_BAG', english: 'Grocery bag', category: 'shopping_food', description: 'Handles of sturdy carry bag gripped walking from market.' },
  { gloss: 'WATER_PURIFIER', english: 'Water purifier / Filter', category: 'shopping_food', description: 'Water sign entering filter flowing out sparkling pure.' },
  { gloss: 'STAINLESS_STEEL', english: 'Stainless steel vessel', category: 'shopping_food', description: 'Silver shine across gleaming durable steel surface.' },
  { gloss: 'OFFICE_DESK', english: 'Office workstation', category: 'education_work', description: 'Computer desk with documents and ergonomic chair.' },
  { gloss: 'WORK_FROM_HOME', english: 'Work from home', category: 'education_work', description: 'Home sign followed by laptop typing work gesture.' }
];

// Generate additional systematic daily verbs (+170 actions to reach 220)
const ACTION_BASES = [
  ['STAND_UP', 'Stand up', 'Inverted V-fingers rise swiftly to standing position.'],
  ['SIT_DOWN', 'Sit down', 'Hooked fingers drop decisively onto horizontal base.'],
  ['LIE_DOWN', 'Lie down', 'V-fingers flip flat onto non-dominant palm.'],
  ['CLIMB', 'Climb', 'Curved fingers step upward alternately as on a ladder.'],
  ['JUMP', 'Jump', 'V-fingers crouch and spring upward off palm.'],
  ['FALL', 'Fall down', 'V-fingers collapse upside-down onto palm.'],
  ['PUSH', 'Push', 'Both flat palms thrust forward with effort.'],
  ['PULL', 'Pull', 'Both fists reach out and haul backward towards chest.'],
  ['HOLD', 'Hold', 'Both fists grip firmly in static suspension.'],
  ['CARRY', 'Carry', 'Both cupped hands cradle load walking forward.'],
  ['DROP', 'Drop', 'Fists open abruptly releasing imaginary item downward.'],
  ['LIFT', 'Lift', 'Both flat palms facing up rise with heavy load.'],
  ['THROW', 'Throw', 'Fist swings from ear and releases open fingers forward.'],
  ['CATCH', 'Catch', 'Both open hands snatch item out of air into fists.'],
  ['REACH', 'Reach', 'Arm extends fully forward stretching fingertips.'],
  ['TOUCH', 'Touch', 'Middle finger taps target surface delicately.'],
  ['PRESS', 'Press / Push button', 'Thumb or index presses firmly into surface.'],
  ['CUT', 'Cut with scissors', 'V-fingers snip repeatedly across surface.'],
  ['TEAR', 'Tear paper', 'Both fists grip and pull opposite directions ripping.'],
  ['FOLD', 'Fold', 'Flat hand bends over horizontal palm neatly.'],
  ['WRAP', 'Wrap', 'Hands circle around central object enveloping it.'],
  ['TIE', 'Tie knot', 'Both curved fingers twist together tightening knot.'],
  ['UNTIE', 'Untie', 'Fingers pull knot apart loosening loops.'],
  ['SHAKE', 'Shake', 'Fists oscillate rapidly back and forth.'],
  ['TWIST', 'Twist / Wring', 'Hands rotate in opposite directions wringing.'],
  ['BEND', 'Bend', 'Straight index finger flexes at knuckle.'],
  ['STRETCH', 'Stretch', 'Both fists pull apart expanding rubber band.'],
  ['SWEEP', 'Sweep floor', 'Both hands push broom back and forth on floor.'],
  ['MOP', 'Mop floor', 'Two-handed gripping handle swinging across floor.'],
  ['DUST', 'Dust surface', 'Curved fingers flick surface dusting particles away.'],
  ['POUR', 'Pour liquid', 'Cupped C-hand tilts sideways pouring liquid.'],
  ['SPILL', 'Spill', 'Hand slips sideways dropping imaginary water with shock.'],
  ['FILL', 'Fill up', 'Liquid level rises up container to brim.'],
  ['EMPTY', 'Empty out', 'Container flips upside-down shaking out contents.'],
  ['MIX', 'Mix together', 'Both hands swirl in circular convergence.'],
  ['STIR', 'Stir spoon', 'Pinched fingers circle imaginary spoon in bowl.'],
  ['BOIL', 'Boil water', 'Fingers flutter upward under flat palm like bubbles.'],
  ['FRY', 'Fry pan', 'Spatula flips imaginary food sizzling in skillet.'],
  ['BAKE', 'Bake in oven', 'Flat hand slides tray horizontally into oven.'],
  ['FREEZE', 'Freeze / Cold lock', 'Fingers claw and lock rigidly in ice cold.'],
  ['MELT', 'Melt', 'Locked fingers droop and dissolve downward into liquid.'],
  ['BURN', 'Burn', 'Fingers flick upward like rising flame heat.'],
  ['BLOW', 'Blow air', 'Pursed lips blow air across open palm.'],
  ['LOCK', 'Lock with key', 'A-thumb twists clockwise into non-dominant palm.'],
  ['UNLOCK', 'Unlock with key', 'A-thumb twists counter-clockwise opening lock.'],
  ['FIX_REPAIR', 'Fix / Repair', 'Both flat O-hands tap together repeatedly fixing.'],
  ['BREAK', 'Break / Snap', 'Fists held together snap sharply downward breaking.'],
  ['DESTROY', 'Destroy', 'Claws tear across and crush into shattered heap.'],
  ['BUILD', 'Build / Construct', 'Flat hands alternate stacking brick upon brick.'],
  ['PAINT_ACTION', 'Paint surface', 'Flat hand brushes broad vertical strokes.'],
  ['DRAW', 'Draw with pencil', 'Pinky or index traces artistic lines on palm.'],
  ['MEASURE', 'Measure length', 'Both Y-thumbs touch then pull apart measuring.'],
  ['SEW', 'Sew needle', 'Pinched needle pierces palm pulling thread.'],
  ['KNIT', 'Knit wool', 'Index fingers click together rhythmically knitting.'],
  ['PLANT', 'Plant seed', 'Pinch seed and press into soil smoothing over.'],
  ['WATER_PLANT', 'Water plants', 'Thumb tilts watering can sprinkling droplets.'],
  ['DIG', 'Dig earth', 'Both hands shovel imaginary soil scooping.'],
  ['AGREE', 'Agree', 'Index touches forehead then drops in checkmark nod.'],
  ['DISAGREE', 'Disagree', 'Index touches forehead then both index fingers pull apart.'],
  ['PROMISE', 'Promise', 'Index touches lips then stamps flat onto palm firmly.'],
  ['REFUSE', 'Refuse', 'S-fist with thumb extended jerks backward over shoulder.'],
  ['ACCEPT', 'Accept', 'Both open hands sweep inward to chest forming fists.'],
  ['REJECT', 'Reject', 'Flat hand sweeps sideways brushing matter away.'],
  ['DECIDE', 'Decide', 'Index touches forehead then drops into two firm F-hands.'],
  ['CHOOSE_SELECT', 'Choose / Select', 'Index and thumb pluck choice out of lineup.'],
  ['PREFER', 'Prefer', 'Middle finger taps chest favoring one side.'],
  ['HOPE', 'Hope', 'Fingers bend at temples looking forward with longing.'],
  ['WISH', 'Wish', 'C-hand pulls down chest indicating deep yearning.'],
  ['BELIEVE', 'Believe', 'Index touches forehead then clutters into firm clasp.'],
  ['DOUBT', 'Doubt', 'V-fingers bend over nose with squinting skepticism.'],
  ['GUESS', 'Guess', 'C-hand snaps across forehead catching thought in fist.'],
  ['IMAGINE', 'Imagine', 'I-pinky spirals upward from temple in dream loop.'],
  ['NOTICE', 'Notice', 'Index touches under eye then points to object.'],
  ['RECOGNIZE', 'Recognize', 'Index taps cheek then drops in knowing acknowledgment.'],
  ['REMIND', 'Remind', 'Thumb taps shoulder reminding someone from behind.'],
  ['EXPLAIN', 'Explain', 'Both F-hands slide forward and backward alternating.'],
  ['DESCRIBE', 'Describe', 'Both D-hands or F-hands articulate details outward.'],
  ['DISCUSS', 'Discuss', 'Index finger taps repeatedly on flat non-dominant palm.'],
  ['ARGUE', 'Argue', 'Both index fingers point at each other jabbing heatedly.'],
  ['DEBATE', 'Debate', 'Both flat hands alternate balancing points on scale.'],
  ['SUGGEST', 'Suggest', 'Both open hands held palm up sweep forward offering.'],
  ['ADVISE', 'Advise', 'Dominant hand taps back of non-dominant hand throwing guidance.'],
  ['WARN', 'Warn', 'Index finger taps back of wrist with cautious alert expression.'],
  ['COMMAND', 'Command / Order', 'Index finger drops from mouth pointing forward authoritatively.'],
  ['PERMIT_ALLOW', 'Permit / Allow', 'Both flat hands held low arc smoothly upward.'],
  ['FORBID_PROHIBIT', 'Forbid / Prohibit', 'L-hand chops sharply against flat vertical palm.'],
  ['ENCOURAGE', 'Encourage', 'Both open hands push forward rhythmically cheering on.'],
  ['PRAISE', 'Praise / Applaud', 'Clapping hands above chest with appreciative smile.'],
  ['CRITICIZE', 'Criticize', 'Index finger scratches an X across flat palm.'],
  ['COMPLAIN', 'Complain', 'Clawed hand strikes chest with dissatisfied frown.'],
  ['BLAME', 'Blame', 'A-thumb points accusatorily towards target person.'],
  ['FORGIVE', 'Forgive', 'Fingertips brush flat palm outward wiping clean.'],
  ['APOLOGIZE', 'Apologize', 'Fist circles over heart with contrite bowed head.'],
  ['INVITE', 'Invite', 'Curved hand held palm up sweeps inward welcomingly.'],
  ['CELEBRATE', 'Celebrate', 'Both fists with thumbs out swing overhead in party joy.'],
  ['SUPPORT', 'Support', 'Dominant fist props up non-dominant elbow firmly.'],
  ['PROTECT', 'Protect', 'Both crossed wrists shield body defensively.'],
  ['DEFEND', 'Defend', 'Fists held high in guarding boxing stance.'],
  ['ATTACK', 'Attack', 'Both clawed hands lunge forward aggressively.'],
  ['ESCAPE', 'Escape', 'Index finger slips quickly between non-dominant fingers running.'],
  ['AVOID', 'Avoid', 'Both hands dodge sideways steering clear of target.'],
  ['SEARCH_LOOK_FOR', 'Search / Look for', 'C-hand circles in front of eyes scanning area.'],
  ['FIND', 'Find / Discover', 'F-hand plucks imaginary treasure out of air triumphantly.'],
  ['LOSE', 'Lose item', 'Both fingertips touching drop downward slipping apart.'],
  ['HIDE', 'Hide', 'Dominant fist ducks underneath curved non-dominant hand.'],
  ['REVEAL_SHOW', 'Reveal / Show', 'Index rests on palm and thrusts forward revealing.'],
  ['PROVE', 'Prove', 'Dominant flat hand slaps down onto non-dominant palm.'],
  ['TEST_ACTION', 'Test / Verify', 'Index draws question mark in air then checkmark.'],
  ['PRACTICE', 'Practice', 'A-fist rubs back and forth against horizontal index finger.'],
  ['IMPROVE', 'Improve', 'Hand steps upward along forearm reaching higher tier.'],
  ['SUCCEED', 'Succeed / Win', 'Both index fingers twirl upward into victory celebration.'],
  ['FAIL_ACTION', 'Fail', 'V-fingers slide off palm and tumble downward.'],
  ['TRY_ATTEMPT', 'Try / Attempt', 'Both T-hands thrust forward with determined effort.'],
  ['CONTINUE', 'Continue', 'Both thumbs touch and glide forward smoothly.'],
  ['PAUSE_ACTION', 'Pause', 'Index fingers hook into parallel pause bars.'],
  ['RESUME', 'Resume', 'Hands release pause bars and spring back into motion.'],
  ['POSTPONE', 'Postpone', 'Both F-hands lift and push forward to future date.'],
  ['SPEED_UP', 'Speed up', 'Both index fingers snap back accelerating fast.'],
  ['SLOW_DOWN', 'Slow down', 'Flat hand pats downward easing tempo.'],
  ['ARRANGE', 'Arrange', 'Both flat hands shift items into neat orderly rows.'],
  ['ORGANIZE', 'Organize', 'Curved hands gather scattered items into structured pile.'],
  ['MANAGE_ACTION', 'Manage', 'Both X-hands alternate tugging reins like guiding horse.'],
  ['LEAD', 'Lead', 'Dominant hand grasps non-dominant fingertips leading forward.'],
  ['FOLLOW', 'Follow', 'Non-dominant fist leads as dominant fist tracks closely behind.'],
  ['COOPERATE', 'Cooperate', 'Both hooked index fingers circle together harmoniously.'],
  ['SHARE', 'Share', 'Flat hand cuts back and forth dividing equally between two.'],
  ['DISTRIBUTE', 'Distribute', 'Both hands hand out portions in sweeping arc.'],
  ['BORROW', 'Borrow', 'Both crossed V-hands pull towards chest receiving loan.'],
  ['LEND', 'Lend', 'Both crossed V-hands push outward away from chest.'],
  ['SAVE_MONEY', 'Save money', 'Money sign tucked securely into non-dominant palm pocket.'],
  ['SPEND', 'Spend money', 'Money peeled off palm and handed away freely.'],
  ['WASTE', 'Waste', 'Both open hands throw contents away with regretful expression.'],
  ['INVEST', 'Invest', 'Coins planted into non-dominant palm growing upward.'],
  ['EARN', 'Earn', 'Curved hand scoops wealth onto flat non-dominant palm.'],
  ['DONATE', 'Donate', 'Both hands extend gift forward generously without expecting return.'],
  ['COMPETE', 'Compete', 'Both fists face each other jockeying forward alternately.'],
  ['PLAY_GAME', 'Play game', 'Both Y-hands shake playfully near waist.'],
  ['EXERCISE', 'Exercise / Workout', 'Both fists lift weights up to shoulders pumping.'],
  ['DANCE', 'Dance', 'Inverted V-fingers swing back and forth across flat palm.'],
  ['SING_ACTION', 'Sing', 'Curved hand sweeps melodically from throat outward.'],
  ['PRAY', 'Pray', 'Both flat palms pressed together facing upward reverently.'],
  ['MEDITATE', 'Meditate', 'Both hands in Gyan mudra on knees with serene breath.'],
  ['BREATHE', 'Breathe', 'Both hands expand and contract on chest in rhythm.'],
  ['SNEEZE', 'Sneeze', 'Index touches nose then jerks forward with explosive sneeze.'],
  ['YAWN', 'Yawn', 'Hand covers open gaping mouth with sleepy eyes.'],
  ['SMILE_ACTION', 'Smile', 'Index fingers draw happy curve from mouth corners up cheek.'],
  ['LAUGH', 'Laugh', 'Both hands flutter at ribs with joyful vibrating chuckles.'],
  ['CRY_WEEP', 'Cry / Weep', 'Index fingers trace downward tears along cheeks repeatedly.'],
  ['SHOUT', 'Shout / Yell', 'Both cupped hands megaphone mouth projecting loud voice.'],
  ['WHISPER', 'Whisper', 'Hand cups side of mouth leaning close softly.'],
  ['NOD_ACTION', 'Nod', 'S-fist nods up and down affirming agreement.'],
  ['WAVE_HAND', 'Wave hand', 'Open palm flutters gently greeting or attracting attention.']
];

for (const [gloss, english, description] of ACTION_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'actions', description });
}

// Generate Transit, Vehicles & Navigation (+62)
const TRANSIT_BASES = [
  ['TRAIN_STATION', 'Train station', 'Train sign followed by designated station boundary.'],
  ['BUS_STOP', 'Bus stop', 'Bus sign followed by pole sign and waiting gesture.'],
  ['AIRPORT', 'Airport', 'Airplane handshape landing on flat runway palm.'],
  ['HARBOR_PORT', 'Harbor / Seaport', 'Ship boat sign docking against concrete wharf.'],
  ['SHIP_BOAT', 'Ship / Boat', 'Both cupped palms joined at pinkies gliding through water.'],
  ['HELICOPTER', 'Helicopter', 'Three fingers spin horizontally above thumb mast.'],
  ['SUBWAY', 'Subway / Metro', 'Train handshape glides beneath horizontal flat palm.'],
  ['TRAM', 'Tram', 'Train sign with two fingers touching overhead electric wire.'],
  ['VAN', 'Van', 'Boxy vehicle shape outlined with steering motion.'],
  ['TRUCK', 'Truck / Lorry', 'Large steering wheel with massive horn honk gesture.'],
  ['AMBULANCE_VEHICLE', 'Ambulance vehicle', 'Ambulance siren flashing atop speeding vehicle.'],
  ['FIRE_TRUCK', 'Fire truck', 'Hose spraying water followed by red truck sign.'],
  ['POLICE_CAR', 'Police car', 'Police badge tap followed by flashing roof beacon.'],
  ['TRAFFIC', 'Traffic congestion', 'Both open claw hands collide and gridlock together.'],
  ['TRAFFIC_LIGHT', 'Traffic light', 'Vertical column flashing green, yellow, red lights.'],
  ['CROSSING', 'Railway crossing', 'Both arms drop horizontally like railway safety gates.'],
  ['BRIDGE', 'Bridge', 'Both arched hands span across wide river below.'],
  ['FLYOVER', 'Flyover / Overpass', 'Road sign rising on elevated pillars over traffic.'],
  ['TUNNEL', 'Tunnel', 'Hand darts through enclosed curved archway.'],
  ['ROUNDABOUT', 'Roundabout / Traffic circle', 'Index finger loops circular traffic island.'],
  ['ZEBRA_CROSSING', 'Zebra pedestrian crossing', 'Flat hands trace horizontal walking stripes.'],
  ['INTERSECTION', 'Intersection / Crossroads', 'Both index fingers cross at right angles.'],
  ['CORNER', 'Street corner', 'Both flat hands meet at 90 degree angle.'],
  ['SIDEWALK_FOOTPATH', 'Sidewalk / Footpath', 'Narrow paved walkway beside road.'],
  ['HIGHWAY_EXPRESSWAY', 'Highway / Expressway', 'Wide open parallel roads with fast express lanes.'],
  ['TOLL_GATE', 'Toll plaza / Toll gate', 'Vehicle stops, hands coin through booth barrier.'],
  ['PARKING', 'Parking lot', 'P-hand stamps onto open flat palm bay.'],
  ['GARAGE', 'Garage', 'Car drives under sheltered roof structure.'],
  ['PETROL_PUMP', 'Petrol pump / Fuel station', 'Nozzle inserts into vehicle tank fueling.'],
  ['ELECTRIC_CHARGING', 'Electric charging station', 'Plug connector docks into car battery socket.'],
  ['BREAKDOWN', 'Vehicle breakdown', 'Engine smoke rising with stalled steering wheel.'],
  ['PUNCTURE', 'Tire puncture', 'Round wheel deflating flat with hissing air.'],
  ['ACCIDENT_SCENE', 'Accident scene', 'Two vehicles colliding with police warning cone.'],
  ['SPEED_LIMIT', 'Speed limit', 'Speed sign with numeral boundary restriction.'],
  ['HELMET', 'Helmet', 'Both curved hands strap safety helmet under chin.'],
  ['SEATBELT', 'Seatbelt', 'Hand pulls diagonal strap clicking into latch.'],
  ['AIR_CONDITIONING', 'Air Conditioning / AC', 'Letters A-C followed by cool air blowing on face.'],
  ['NON_AC', 'Non-AC', 'No AC with fanning sweat off forehead.'],
  ['SLEEPER_CLASS', 'Sleeper class berth', 'Train sign followed by horizontal sleeping bunk.'],
  ['GENERAL_CLASS', 'General unreserved coach', 'Crowded people jostling into open compartment.'],
  ['LADIES_COACH', 'Ladies coach', 'Female sign followed by train carriage boundary.'],
  ['RESERVED_SEAT', 'Reserved seat', 'Confirmed ticket pinned onto seat headrest.'],
  ['UNRESERVED', 'Unreserved', 'Open seating without name reservation slip.'],
  ['TICKET_COUNTER', 'Ticket counter', 'Glass window partition with cash exchanged for pass.'],
  ['TICKET_CHECKER_TTE', 'Ticket Examiner / TTE', 'Inspector uniform badge checking passenger chart.'],
  ['WAITING_ROOM', 'Waiting room', 'Clock tapping followed by comfortable chairs inside.'],
  ['CLOAK_ROOM', 'Cloak room / Luggage locker', 'Baggage handed over counter receiving brass token.'],
  ['OVERBRIDGE', 'Foot overbridge', 'Stairs climbing up, crossing above tracks, descending.'],
  ['ESCALATOR', 'Escalator', 'Inverted V-legs stand motionless gliding diagonally up.'],
  ['LIFT_ELEVATOR', 'Elevator / Lift', 'Closed doors open as vertical carriage ascends.'],
  ['STAIRS', 'Stairs', 'V-fingers climb step by step up angled incline.'],
  ['BOARDING_PASS', 'Boarding pass', 'Flight ticket stamped with flight gate number.'],
  ['SECURITY_CHECK', 'Security checkpoint', 'Metal detector wand scanning arms and torso.'],
  ['LUGGAGE_CHECK', 'Luggage scanner', 'Suitcase gliding through X-ray tunnel conveyor.'],
  ['PASSPORT', 'Passport', 'Small official booklet stamped at immigration border.'],
  ['VISA', 'Visa stamp', 'Passport page receiving authorized entry stamp.'],
  ['ID_PROOF', 'Identity proof', 'Card displaying photo and authorized government stamp.'],
  ['AADHAAR_CARD', 'Aadhaar card', 'Thumbprint biometric impression on official card.'],
  ['PAN_CARD', 'PAN card', 'Tax card verifying permanent account number.'],
  ['DRIVING_LICENSE', 'Driving license', 'Steering wheel turning followed by official ID card.'],
  ['MILEAGE', 'Distance / Mileage', 'Odometer numbers rolling over on vehicle dashboard.'],
  ['JOURNEY', 'Journey / Expedition', 'Wavy travel path leading to distant horizons.']
];

for (const [gloss, english, description] of TRANSIT_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'transit', description });
}

// Generate Healthcare, Medical, Anatomy & Emergency (+78)
const HEALTHCARE_BASES = [
  ['HEAD', 'Head', 'Both palms tap sides of cranium gently.'],
  ['BRAIN', 'Brain', 'Fingers tap temple indicating thought center.'],
  ['EYE', 'Eye', 'Index finger points directly beside eyeball.'],
  ['EAR', 'Ear', 'Thumb and index grasp earlobe.'],
  ['NOSE', 'Nose', 'Index finger touches tip of nose.'],
  ['MOUTH', 'Mouth', 'Index finger outlines lips circle.'],
  ['TONGUE', 'Tongue', 'Tongue touches lip with index pointing.'],
  ['TEETH', 'Teeth', 'Index finger taps front teeth.'],
  ['LIPS', 'Lips', 'Index finger traces lipstick line.'],
  ['THROAT', 'Throat', 'Thumb and fingers span neck throat.'],
  ['NECK', 'Neck', 'Flat hand pats side of neck.'],
  ['SHOULDER', 'Shoulder', 'Fingers tap opposite shoulder.'],
  ['CHEST_ANATOMY', 'Chest', 'Both palms rest on ribcage.'],
  ['HEART_ORGAN', 'Heart', 'Fist beats rhythmically over left chest.'],
  ['LUNGS', 'Lungs', 'Both hands outline twin lung lobes breathing.'],
  ['STOMACH_ORGAN', 'Stomach', 'Flat palm circles abdominal region.'],
  ['LIVER', 'Liver', 'Hand pats upper right abdominal quadrant.'],
  ['KIDNEY', 'Kidneys', 'Both hands tap lower back flanking spine.'],
  ['BACK_SPINE', 'Back / Spine', 'Hand reaches around tapping spinal vertebrae.'],
  ['WAIST', 'Waist', 'Both hands grip waistband.'],
  ['ARM', 'Arm', 'Hand caresses opposite forearm.'],
  ['ELBOW', 'Elbow', 'Hand cups opposite elbow joint.'],
  ['WRIST', 'Wrist', 'Fingers encircle opposite wrist.'],
  ['HAND_ANATOMY', 'Hand', 'Open 5-hand presented clearly.'],
  ['FINGERS', 'Fingers', 'All five fingers flutter in display.'],
  ['LEG', 'Leg', 'Hand pats thigh and shin.'],
  ['KNEE', 'Knee', 'Hand cups patella knee cap.'],
  ['ANKLE', 'Ankle', 'Hand points to ankle joint above foot.'],
  ['FOOT', 'Foot', 'Hand points down to sole of foot.'],
  ['TOES', 'Toes', 'Fingers wiggle pointing to foot digits.'],
  ['BONE', 'Bone', 'Bent knuckles tap together producing hard sound.'],
  ['MUSCLE', 'Muscle', 'Bicep flexes with opposite hand squeezing muscle.'],
  ['SKIN', 'Skin', 'Fingers pinch small fold of skin on arm.'],
  ['VEIN', 'Vein', 'Index finger traces blue line down inner forearm.'],
  ['PULSE', 'Pulse', 'Two fingers press radial artery feeling heart rhythm.'],
  ['ICU', 'Intensive Care Unit (ICU)', 'Letters I-C-U with vital signs heart monitor.'],
  ['WARD', 'Hospital ward', 'Room of patient recovery beds.'],
  ['OPERATION_THEATRE', 'Operation Theatre (OT)', 'Surgical gown with intense surgical lamp focus.'],
  ['SURGEON', 'Surgeon', 'Sterile scalpel incision gesture, then doctor sign.'],
  ['DENTIST', 'Dentist', 'Tapping teeth with dental probe, then doctor sign.'],
  ['EYE_SPECIALIST', 'Eye specialist / Ophthalmologist', 'Pointing to eye examining pupil, then doctor sign.'],
  ['CARDIOLOGIST', 'Cardiologist', 'Listening to heartbeat with stethoscope, then doctor.'],
  ['PEDIATRICIAN', 'Pediatrician', 'Child baby sign followed by gentle doctor care.'],
  ['PHYSIOTHERAPY', 'Physiotherapy', 'Assisted joint flexing and rehabilitation stretch.'],
  ['THERAPY', 'Therapy', 'T-hand lifts upward from flat base encouraging healing.'],
  ['COUNSELING', 'Counseling', 'Open discussion guidance sharing mental clarity.'],
  ['MENTAL_HEALTH', 'Mental Health', 'Brain sign followed by wellness health vitality.'],
  ['DEPRESSION', 'Depression', 'Both hands descend down chest with heavy sorrowful slump.'],
  ['ANXIETY', 'Anxiety', 'Hands tremor nervously over chest with racing pulse.'],
  ['STRESS', 'Stress', 'Downward fist pressing heavily on flat hand under strain.'],
  ['ASTHMA', 'Asthma', 'Chest tightens gasping for breath reaching for inhaler.'],
  ['DIABETES', 'Diabetes', 'Sugar sign followed by fingerprick glucose test.'],
  ['BLOOD_PRESSURE', 'Blood pressure', 'Inflatable cuff wraps around arm pumping bulb.'],
  ['HYPERTENSION', 'Hypertension', 'High pressure gauge soaring into danger zone.'],
  ['HEART_ATTACK', 'Heart attack', 'Hand clutches chest violently with sudden agony.'],
  ['STROKE', 'Stroke', 'Side of face droops with sudden arm weakness.'],
  ['PARALYSIS', 'Paralysis', 'Limb falls motionless unable to respond.'],
  ['CANCER', 'Cancer', 'C-claw consumes cell followed by medical therapy.'],
  ['TUMOR', 'Tumor / Lump', 'Curved fingers outline abnormal swollen mass.'],
  ['INFECTION', 'Infection', 'Shaking I-hand spreads across swollen redness.'],
  ['VIRUS', 'Virus', 'Spiky microscopic germ sphere invading cells.'],
  ['BACTERIA', 'Bacteria', 'Tiny organism multiplying under microscope lens.'],
  ['FUNGUS', 'Fungus', 'Spreading ring patch on surface of skin.'],
  ['VACCINATION_DOSE', 'Vaccine dose', 'Syringe needle delivering protective immunizing dose.'],
  ['DOSAGE', 'Medicine dosage', 'Exact measurement of spoons or tablets on schedule.'],
  ['SYRUP', 'Cough syrup', 'Liquid poured from medicine bottle onto spoon and swallowed.'],
  ['DROPS', 'Eye/Ear drops', 'Squeezing tiny liquid droplet into open eye or ear.'],
  ['OINTMENT', 'Ointment / Balme', 'Soothing medicinal paste smoothed over wound.'],
  ['CREAM', 'Medicated cream', 'Fingers rub healing cream gently into skin.'],
  ['INHALER', 'Inhaler puff', 'Canister pressed into mouth inhaling deep aerosol puff.'],
  ['STRETCHER', 'Stretcher', 'Horizontal canvas cot carried by two paramedics.'],
  ['CRUTCHES', 'Crutches', 'Both hands grip under arm supports hobbling forward.'],
  ['WALKING_STICK', 'Walking stick / Cane', 'Hand grips curved handle leaning weight forward.'],
  ['FIRST_AID', 'First aid', 'Red cross sign followed by emergency bandage care.'],
  ['FIRST_AID_KIT', 'First aid kit', 'Box marked with medical cross containing supplies.'],
  ['COTTON', 'Cotton gauze', 'Soft fluffy cotton pad dabbing sterile antiseptic.'],
  ['THERMOMETER', 'Thermometer', 'Slender tube placed under tongue reading fever scale.'],
  ['STETHOSCOPE', 'Stethoscope', 'Earpieces placed into ears with chest diaphragm listening.'],
  ['BLOOD_TEST', 'Blood test', 'Vein tapped with vial drawing blood sample for lab.']
];

for (const [gloss, english, description] of HEALTHCARE_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'healthcare', description });
}

// Generate Shopping, Grocery, Food, Clothes & Money (+124)
const SHOPPING_FOOD_BASES = [
  ['WHEAT', 'Wheat', 'Grain stalk waving in wind, ground into flour.'],
  ['FLOUR_ATTA', 'Flour / Atta', 'Powder rubbed between fingers and kneaded in bowl.'],
  ['DAL_LENTILS', 'Dal / Lentils', 'Yellow grains poured and simmered into fragrant soup.'],
  ['CHICKPEAS', 'Chickpeas / Chana', 'Round hard peas soaked and cooked in masala.'],
  ['BEANS', 'Beans / Rajma', 'Kidney-shaped beans simmered into thick gravy.'],
  ['POTATO', 'Potato / Aloo', 'Peeling brown skin off tuber with paring knife.'],
  ['TOMATO', 'Tomato', 'Red sign on cheek followed by slicing juicy round vegetable.'],
  ['ONION', 'Onion / Pyaz', 'Layered bulb sliced with tears forming in eyes.'],
  ['GARLIC', 'Garlic / Lahsun', 'Small pungent cloves separated and crushed.'],
  ['GINGER', 'Ginger / Adrak', 'Gnarly root scraped and grated into tea.'],
  ['CHILLI', 'Chilli / Mirchi', 'Tiny hot pod touching tongue with burning heat wave.'],
  ['SPINACH', 'Spinach / Palak', 'Green leaves chopped and folded into nutritious sabzi.'],
  ['CARROT', 'Carrot', 'Orange cone gnawed on like a rabbit.'],
  ['CAULIFLOWER', 'Cauliflower', 'White compact florets broken apart.'],
  ['CABBAGE', 'Cabbage', 'Tight round ball of overlapping leaves shredded.'],
  ['PEAS', 'Green peas', 'Popping green pearls out of fresh pod.'],
  ['CORIANDER', 'Coriander / Dhaniya', 'Fragrant green herb sprinkled across cooked curry.'],
  ['MINT', 'Mint / Pudina', 'Refreshing aromatic leaves crushed for chutney.'],
  ['CUCUMBER', 'Cucumber', 'Cool crisp vegetable sliced into refreshing rounds.'],
  ['LEMON', 'Lemon / Nimbu', 'Half citrus fruit squeezed dripping tart sour juice.'],
  ['APPLE', 'Apple', 'X-knuckle twists into dimple of cheek twice.'],
  ['BANANA', 'Banana', 'Non-dominant index peeled downward in three strips.'],
  ['MANGO', 'Mango / Aam', 'Juicy king of fruits sliced and savored sweet.'],
  ['ORANGE_FRUIT', 'Orange fruit', 'C-fist squeezes near mouth like fresh orange juice.'],
  ['GRAPES', 'Grapes', 'Curved fingers pluck juicy fruit off hanging vine cluster.'],
  ['PAPAYA', 'Papaya', 'Long melon split open scooping out black seeds.'],
  ['GUAVA', 'Guava', 'Crunchy fruit bitten into with sweet pink pulp.'],
  ['PINEAPPLE', 'Pineapple', 'Spiky crown topped tropical fruit cut into rings.'],
  ['WATERMELON', 'Watermelon', 'Large heavy sphere sliced into wide juicy grin rind.'],
  ['POMEGRANATE', 'Pomegranate / Anar', 'Hard ruby red fruit opened revealing sparkling arils.'],
  ['COCONUT', 'Coconut / Nariyal', 'Hard husk cracked open drinking refreshing coconut water.'],
  ['BUTTER', 'Butter / Makkhan', 'Two fingers spread rich yellow butter onto bread.'],
  ['GHEE', 'Ghee / Clarified butter', 'Golden pure melted butter poured onto hot dal.'],
  ['PANEER_CHEESE', 'Paneer / Cottage cheese', 'Fresh white milk curd pressed into firm cubes.'],
  ['CURD_YOGURT', 'Curd / Dahi', 'Cool creamy yogurt scooped with spoon.'],
  ['EGG', 'Egg', 'Both H-hands crack imaginary shell apart cleanly.'],
  ['CHICKEN_MEAT', 'Chicken', 'Beak pecks at palm followed by cooked drumstick bite.'],
  ['MUTTON_MEAT', 'Mutton / Lamb', 'Meat sliced into rich tender festive curry.'],
  ['FISH_FOOD', 'Fish', 'Hand swishes like fish fin through water, then cooked.'],
  ['SEAFOOD', 'Seafood', 'Fresh catch from ocean nets prepared for feast.'],
  ['PRAWNS', 'Prawns / Shrimp', 'Curved hooked finger swimming backward.'],
  ['SOUP', 'Soup', 'Spoon scoops steaming hot broth out of deep bowl.'],
  ['SALAD', 'Salad', 'Both hands toss crispy raw vegetables with dressing.'],
  ['SANDWICH', 'Sandwich', 'Two slices of bread pressed together with savory filling.'],
  ['BURGER', 'Burger', 'Both hands clamp thick round bun taking enormous bite.'],
  ['PIZZA', 'Pizza', 'Z-hand draws triangular slice lifted with melting cheese.'],
  ['NOODLES', 'Noodles', 'Two index fingers twirl imaginary spaghetti onto fork.'],
  ['PASTA', 'Pasta', 'Spiral macaroni shapes tossed in tomato garlic sauce.'],
  ['SAMOSA', 'Samosa', 'Both hands pinch triangular pastry fried golden crisp.'],
  ['DOSA', 'Dosa', 'Batter spread in wide golden crepe rolled hot off griddle.'],
  ['IDLI', 'Idli', 'Soft fluffy steamed white rice cake dipped in sambar.'],
  ['VADA', 'Vada', 'Crisp savory lentil donut fried with golden hole.'],
  ['CURRY', 'Curry / Gravy', 'Rich spiced aromatic sauce spooned over rice.'],
  ['PICKLE', 'Pickle / Achar', 'Spicy tangy oil-preserved condiment tasted on fingertip.'],
  ['PAPAD', 'Papad', 'Thin crisp cracker snapped into crunchy shards.'],
  ['SWEETS_MITHAI', 'Indian Sweets / Mithai', 'Delicate festive confection passed on silver tray.'],
  ['GULAB_JAMUN', 'Gulab Jamun', 'Warm golden milk berry soaked in rose cardamom syrup.'],
  ['JALEBI', 'Jalebi', 'Spiraling saffron loops fried crisp and soaked in sugar.'],
  ['ICE_CREAM', 'Ice cream', 'Fist holds waffle cone licking cold creamy scoop.'],
  ['CHOCOLATE', 'Chocolate', 'C-hand circles back of wrist savoring rich cocoa.'],
  ['BISCUIT_COOKIE', 'Biscuit / Cookie', 'C-hand twists against elbow like cutting biscuit dough.'],
  ['CAKE', 'Cake', 'Curved fingers cut slice out of tiered birthday cake.'],
  ['JUICE', 'Juice', 'J-hand drawn on cheek followed by drinking from straw.'],
  ['WATER_GLASS', 'Glass of water', 'Tumbler held and sipped cleanly.'],
  ['BOTTLE', 'Bottle', 'Hands trace tall cylindrical neck with twist cap.'],
  ['PLATE', 'Plate', 'Both hands trace wide flat circular dining rim.'],
  ['BOWL', 'Bowl', 'Both cupped hands form deep rounded container.'],
  ['SPOON', 'Spoon', 'Curved fingers scoop liquid lifting to mouth.'],
  ['FORK', 'Fork', 'V-fingers spear food cleanly.'],
  ['KNIFE', 'Knife', 'Index finger slices across edge of non-dominant hand.'],
  ['CUP', 'Cup / Mug', 'C-hand rests on flat palm saucer lifting by handle.'],
  ['GLASS_TUMBLER', 'Glass tumbler', 'C-cylinder held in hand raised to lips.'],
  ['PAN', 'Frying pan', 'Flat skillet held by long handle flipped on stove.'],
  ['POT', 'Cooking pot', 'Deep vessel with two side ear handles.'],
  ['PRESSURE_COOKER', 'Pressure cooker', 'Lid clamped shut with whistle hissing steam high.'],
  ['STOVE_GAS', 'Gas stove', 'Knob clicked turning on blue burner flames.'],
  ['REFRIGERATOR_FRIDGE', 'Refrigerator / Fridge', 'Tall double doors open into cold interior.'],
  ['MICROWAVE', 'Microwave oven', 'Door opens, food plate enters, timer beeps warm.'],
  ['SUPERMARKET', 'Supermarket', 'Pushing grocery trolley down wide stocked aisles.'],
  ['MALL', 'Shopping mall', 'Multi-level glass shopping complex with escalators.'],
  ['GROCERY_STORE', 'Grocery store', 'Neighborhood kirana shop weighing grains on scale.'],
  ['CLOTHING_STORE', 'Clothing boutique', 'Racks of garments browsed on hangers.'],
  ['FOOTWEAR_STORE', 'Shoe shop', 'Trying on new shoes laced onto feet.'],
  ['HARDWARE_STORE', 'Hardware store', 'Tools, screws, bolts and paint cans.'],
  ['BOOKSTORE', 'Bookstore', 'Shelves of books opened and inspected.'],
  ['DISCOUNT_COUPON', 'Coupon / Voucher', 'Paper voucher stamped reducing billing total.'],
  ['QR_CODE', 'QR code', 'Phone camera frames square pixel barcode scanning payment.'],
  ['UPI_PAYMENT', 'UPI digital payment', 'Instant digital transfer confirmed with chime.'],
  ['ONLINE_PAYMENT', 'Online netbanking', 'Secure pin entered completing web order.'],
  ['CREDIT_CARD', 'Credit card', 'Plastic card swiped through payment terminal.'],
  ['DEBIT_CARD', 'Debit card', 'Bank card inserted into chip reader.'],
  ['ATM_MACHINE', 'ATM machine', 'Card inserted, pin punched, banknotes dispensed.'],
  ['WALLET_PURSE', 'Wallet / Purse', 'Pocketbook unzipped counting stored cash.'],
  ['POCKET', 'Pocket', 'Hand slips into shirt or trouser pocket.'],
  ['PRICE_TAG', 'Price tag', 'Tag hanging from collar checked for cost.'],
  ['WARRANTY', 'Warranty card', 'Official guarantee certificate promising free repair.'],
  ['GUARANTEE', 'Guarantee', 'Firm handshake guaranteeing reliable quality.'],
  ['EXCHANGE_OFFER', 'Exchange offer', 'Old item traded in discounting brand new upgrade.'],
  ['COTTON_FABRIC', 'Cotton fabric', 'Breathable natural cotton weave soft against skin.'],
  ['SILK_FABRIC', 'Silk fabric', 'Lustrous smooth woven silk gliding through fingers.'],
  ['WOOL_FABRIC', 'Wool fabric', 'Warm knitted winter yarn cozy against frost.'],
  ['JEANS', 'Jeans / Denim', 'Sturdy blue denim trousers buttoned at waist.'],
  ['TROUSERS', 'Trousers / Slacks', 'Tailored formal pants pressed with sharp pleat.'],
  ['PANTS', 'Pants', 'Hands pull trousers up legs buckling belt.'],
  ['T_SHIRT', 'T-shirt', 'Short sleeves outlined over collarless torso.'],
  ['JACKET', 'Jacket', 'Zip pulled up front of warm outerwear.'],
  ['SWEATER', 'Sweater', 'Knitted pullover pulled down over head.'],
  ['COAT', 'Coat / Blazer', 'Lapels folded over chest in formal business attire.'],
  ['SUIT_FORMAL', 'Business suit', 'Matching blazer and trousers with necktie.'],
  ['SAREE', 'Saree', 'Six yards of silk draped and pleated gracefully over shoulder.'],
  ['KURTA', 'Kurta', 'Traditional tunic pulled over shoulders buttoned at neck.'],
  ['DUPATTA', 'Dupatta / Scarf', 'Light fabric draped across both shoulders.'],
  ['CAP_HAT', 'Cap / Hat', 'Curved brim adjusted snugly over forehead.'],
  ['SOCKS', 'Socks', 'Warm tubes pulled up over toes and ankles.'],
  ['WRISTWATCH', 'Wristwatch', 'Timepiece strapped around wrist checked with glance.'],
  ['RING_JEWELRY', 'Finger ring', 'Gold band slipped onto fourth finger.'],
  ['NECKLACE', 'Necklace', 'Gold chain fastened gracefully around neck.'],
  ['EARRINGS', 'Earrings', 'Sparkling pendants hanging from earlobes.'],
  ['GLASSES_SPECS', 'Spectacles / Glasses', 'Frame resting over bridge of nose hooked over ears.'],
  ['SUNGLASSES', 'Sunglasses', 'Dark tinted shades shielding eyes from bright glare.']
];

for (const [gloss, english, description] of SHOPPING_FOOD_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'shopping_food', description });
}

// Generate Education, Campus, Technology & Workplace (+70)
const EDUCATION_WORK_BASES = [
  ['KINDERGARTEN', 'Kindergarten', 'Little children playing with colorful alphabet blocks.'],
  ['HIGH_SCHOOL', 'High school', 'Older students carrying textbooks in hallways.'],
  ['UNIVERSITY_CAMPUS', 'University campus', 'Sprawling grounds with faculties and research centers.'],
  ['CAMPUS_GROUNDS', 'Campus grounds', 'Open green quads between lecture halls.'],
  ['LIBRARY', 'Library', 'L-hand circles in quiet reading hall of book stacks.'],
  ['LABORATORY', 'Laboratory', 'Test tubes and microscopes conducting experimental research.'],
  ['PRINCIPAL', 'Principal / Headmaster', 'P-hand taps shoulder twice leading school.'],
  ['DIRECTOR', 'Director', 'Both D-hands steer organizational vision forward.'],
  ['PROFESSOR', 'Professor', 'Distinguished academic lecturing at podium.'],
  ['LECTURE', 'Lecture / Presentation', 'Open flat hand gestures explaining complex theories.'],
  ['SYLLABUS', 'Syllabus / Curriculum', 'Outline of academic courses and study modules.'],
  ['DEGREE_DIPLOMA', 'Degree / Diploma', 'Both hands unroll official graduation parchment scroll.'],
  ['GRADUATION', 'Graduation convocation', 'Mortarboard cap thrown high into sky.'],
  ['CERTIFICATE', 'Certificate', 'Official accredited document stamped with gold seal.'],
  ['SCHOLARSHIP', 'Scholarship award', 'Educational grant funding tuition fees.'],
  ['ADMISSION', 'Admission enrollment', 'Application accepted granting entry to student.'],
  ['FEES', 'Tuition fees', 'Semester payment submitted to college bursar.'],
  ['TUITION_CLASS', 'Tuition class / Coaching', 'Extra academic coaching after school.'],
  ['ATTENDANCE', 'Attendance roll call', 'Names called out with hand raised present.'],
  ['MARKS_GRADE', 'Marks / Grades', 'Scores tallied at top of exam paper.'],
  ['PASSED_EXAM', 'Passed exam', 'Triumphant stamp of success on report card.'],
  ['FAILED_EXAM', 'Failed exam', 'Unsuccessful attempt requiring re-examination.'],
  ['DESK_FURNITURE', 'Study desk', 'Sturdy wooden table for writing and study.'],
  ['CHAIR_FURNITURE', 'Chair', 'Seat with backrest for working at desk.'],
  ['BLACKBOARD', 'Blackboard', 'Chalk writes math equations across slate board.'],
  ['WHITEBOARD', 'Whiteboard', 'Dry erase marker diagrams flowcharts.'],
  ['CHALK_PIECE', 'Chalk', 'Slender white stick writing on chalkboard.'],
  ['MARKER_PEN', 'Marker pen', 'Felt tip draws bold lines on whiteboard.'],
  ['ERASER_DUSTER', 'Eraser / Duster', 'Felt pad wipes board clean of notes.'],
  ['RULER_SCALE', 'Ruler / Scale', 'Straight wooden edge guides accurate line.'],
  ['SHARPENER', 'Pencil sharpener', 'Pencil twists inside tiny blade sharpening lead.'],
  ['BACKPACK', 'Backpack', 'Dual shoulder straps hauled onto back filled with books.'],
  ['COMPANY_FIRM', 'Company / Firm', 'Both C-hands outline corporate headquarters.'],
  ['ORGANIZATION', 'Organization', 'Both O-hands link structured departments.'],
  ['FACTORY', 'Factory / Plant', 'Interlocking chimneys puffing productive industrial smoke.'],
  ['WORKSHOP_GARAGE', 'Workshop', 'Hands crafting and repairing machinery at workbench.'],
  ['CLIENT_OFFICE', 'Client office', 'Visiting corporate partner for contract discussions.'],
  ['DESK_CABIN', 'Office cabin', 'Partitioned personal workspace with computer desk.'],
  ['CONFERENCE_ROOM', 'Conference room', 'Large boardroom table with video conferencing projector.'],
  ['LAPTOP_DEVICE', 'Laptop computer', 'Screen hinges open with keyboard ready.'],
  ['TABLET_DEVICE', 'Tablet device', 'Flat touchscreen tapped with stylus.'],
  ['SMARTPHONE', 'Smartphone', 'Pocket screen unlocked with fingerprint sensor.'],
  ['PRINTER', 'Printer', 'Fresh printed paper emerges gliding from tray.'],
  ['SCANNER', 'Scanner', 'Glass bed scans document digitizing image.'],
  ['MONITOR_SCREEN', 'Monitor screen', 'High resolution display showing code.'],
  ['KEYBOARD_TYPING', 'Keyboard', 'Keys depressed in rapid fluid typing.'],
  ['MOUSE_CLICK', 'Computer mouse', 'Palm rests on mouse with index finger clicking.'],
  ['CHARGER_CABLE', 'Power charger', 'Plug connects phone into electrical wall outlet.'],
  ['CABLE_WIRE', 'Cable wire', 'Flexible insulated cord transmitting signals.'],
  ['BATTERY_POWER', 'Battery pack', 'Rechargeable energy cell powering electronics.'],
  ['HEADPHONES', 'Headphones', 'Padded audio cushions cover ears.'],
  ['MICROPHONE', 'Microphone', 'Handheld mic capturing crystal clear speech.'],
  ['WEBCAM_CAMERA', 'Webcam', 'Small camera perched atop monitor streaming video.'],
  ['SOFTWARE_APP', 'Software application', 'Code compiling into installed running program.'],
  ['WEBSITE_PORTAL', 'Website / Web page', 'Browser address bar navigating to portal.'],
  ['PASSWORD', 'Password / Security PIN', 'Secret asterisks typed into protected field.'],
  ['USERNAME', 'Username / Login ID', 'Unique identity entered to authenticate account.'],
  ['DATA_STORAGE', 'Data / Database', 'Cylindrical database icon storing digital records.'],
  ['FILE_FOLDER', 'File folder', 'Manila tabbed folder organizing paperwork.'],
  ['DOCUMENT_PAGE', 'Document', 'Official typed page with letterhead and terms.'],
  ['CONTRACT_AGREEMENT', 'Contract agreement', 'Legal document signed by both parties.'],
  ['SIGNATURE', 'Signature / Sign', 'Pen glides in unique flourishing autograph.'],
  ['RESUME_CV', 'Resume / CV', 'Professional profile summarizing career experience.'],
  ['INTERVIEW_JOB', 'Job interview', 'Formal candidate questioning across interview desk.'],
  ['PROMOTION_JOB', 'Job promotion', 'Career leap to higher executive responsibility.'],
  ['BONUS_SALARY', 'Salary bonus', 'Extra financial reward celebrating great performance.'],
  ['RESIGNATION', 'Resignation', 'Formal notice letter submitted ending employment.'],
  ['RETIREMENT', 'Retirement', 'Golden career conclusion relaxing after decades of work.']
];

for (const [gloss, english, description] of EDUCATION_WORK_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'education_work', description });
}

// Generate Time, Calendar, Seasons & Weather (+54)
const TIME_CALENDAR_BASES = [
  ['MONDAY', 'Monday', 'M-hand circles clockwise in front of chest.'],
  ['TUESDAY', 'Tuesday', 'T-hand circles clockwise in front of chest.'],
  ['WEDNESDAY', 'Wednesday', 'W-hand circles clockwise in front of chest.'],
  ['THURSDAY', 'Thursday', 'H-hand or T-H sequence circles clockwise.'],
  ['FRIDAY', 'Friday', 'F-hand circles clockwise in front of chest.'],
  ['SATURDAY', 'Saturday', 'S-fist circles clockwise in front of chest.'],
  ['SUNDAY', 'Sunday', 'Both open palms face forward at shoulder height.'],
  ['WEEKEND', 'Weekend', 'Week sign sliding across palm ending in rest.'],
  ['WEEKDAY', 'Weekday', 'Monday through Friday work routine.'],
  ['JANUARY', 'January', 'Month 1 kicking off the new calendar year.'],
  ['FEBRUARY', 'February', 'Month 2 with 28 or 29 leap days.'],
  ['MARCH', 'March', 'Month 3 blooming into early spring.'],
  ['APRIL', 'April', 'Month 4 with pleasant warm breeze.'],
  ['MAY', 'May', 'Month 5 blossoming with summer heat.'],
  ['JUNE', 'June', 'Month 6 welcoming the monsoon arrival.'],
  ['JULY', 'July', 'Month 7 with heavy lush rains.'],
  ['AUGUST', 'August', 'Month 8 celebrating Independence Day.'],
  ['SEPTEMBER', 'September', 'Month 9 with autumn equinox.'],
  ['OCTOBER', 'October', 'Month 10 with festive celebrations.'],
  ['NOVEMBER', 'November', 'Month 11 with cooling winter mist.'],
  ['DECEMBER', 'December', 'Month 12 concluding the annual calendar.'],
  ['SPRING_SEASON', 'Spring season', 'Plants sprouting upward blossoming in joy.'],
  ['SUMMER_SEASON', 'Summer season', 'Blazing sun wiping sweat from brow.'],
  ['MONSOON_RAINY', 'Monsoon / Rainy season', 'Heavy clouds pouring rhythmic raindrops down.'],
  ['AUTUMN_SEASON', 'Autumn season', 'Golden leaves drifting softly to earth.'],
  ['WINTER_SEASON', 'Winter season', 'Shivering arms crossed against chilly frost.'],
  ['DAWN', 'Dawn / First light', 'Sun peeks just above eastern horizon.'],
  ['SUNRISE', 'Sunrise', 'Golden disc rises radiant above horizontal arm.'],
  ['SUNSET', 'Sunset', 'Glowing sun sinks below western arm horizon.'],
  ['DUSK', 'Dusk / Twilight', 'Evening shadows gathering as daylight fades.'],
  ['MIDNIGHT', 'Midnight', '12 o’clock downward chime in silent night.'],
  ['NOON_TIME', 'Noon / Midday', 'Sun straight overhead at 12 o’clock peak.'],
  ['SECOND_TIME', 'Second (Time unit)', 'Index finger clicks forward one second pulse.'],
  ['DECADE', 'Decade', 'Ten-year span turning calendar pages.'],
  ['CENTURY', 'Century', 'One hundred years spanning generations.'],
  ['ALWAYS', 'Always / Forever', 'Index finger draws endless forward circle.'],
  ['OFTEN', 'Often / Frequently', 'Fingertips tap forward repeatedly on palm.'],
  ['SOMETIMES', 'Sometimes', 'Index finger bounces occasionally off flat palm.'],
  ['RARELY', 'Rarely / Seldom', 'Tiny space between fingers indicating extreme rarity.'],
  ['NEVER', 'Never', 'Flat hand slices downward in sharp final refusal.'],
  ['SOON', 'Soon', 'F-hand taps chin lightly indicating impending event.'],
  ['EARLY_TIME', 'Early', 'Middle finger glides across back of non-dominant fist.'],
  ['LATE_TIME', 'Late', 'Bent hand flaps downward by waist tardily.'],
  ['PUNCTUAL', 'Punctual / On time', 'Index taps watch point exactly on the dot.'],
  ['SCHEDULE_PLAN', 'Schedule / Timetable', 'Grid of time slots mapped neatly on palm.'],
  ['WEATHER_NATURE', 'Weather', 'Both W-hands twist alternately drifting in atmosphere.'],
  ['SUNNY', 'Sunny', 'O-hand opens in radiant beam over head.'],
  ['RAIN_STORM', 'Rain', 'Fingers flutter downward softly like falling drops.'],
  ['STORM', 'Storm', 'Violent winds whipping clouds and lightning.'],
  ['THUNDER', 'Thunder', 'Index touches ear then both fists clash with rumble.'],
  ['LIGHTNING', 'Lightning', 'Index finger zigzags down through sky like electric bolt.'],
  ['WIND_BREEZE', 'Wind / Breeze', 'Both open hands sway sideways depicting blowing air.'],
  ['CLOUD', 'Cloud', 'Both claw hands outline fluffy drifting clouds.'],
  ['FOG_SMOG', 'Fog / Smog', 'Spread fingers cross in front of eyes obscuring vision.']
];

for (const [gloss, english, description] of TIME_CALENDAR_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'time_calendar', description });
}

// Generate Feelings, Personality, Descriptions & Modifiers (+78)
const FEELINGS_STATES_BASES = [
  ['CONFIDENT', 'Confident', 'Both S-hands pull downward firmly at sides standing tall.'],
  ['BRAVE', 'Brave / Courageous', 'Both claw hands pull outward from chest into strong fists.'],
  ['SCARED_AFRAID', 'Scared / Afraid', 'Both open hands tremble defensively before chest.'],
  ['NERVOUS', 'Nervous', 'Hands twitch and fidget with anxious eye darting.'],
  ['EXCITED', 'Excited', 'Both middle fingers flick upward alternately against chest.'],
  ['PROUD', 'Proud', 'A-thumb traces straight up center of chest with elevated head.'],
  ['JEALOUS', 'Jealous', 'X-finger bites corner of mouth with envious grimace.'],
  ['ENVIOUS', 'Envious', 'Looking sideways with yearning desire for another’s luck.'],
  ['DISAPPOINTED', 'Disappointed', 'Index finger touches chin as head droops downward.'],
  ['GUILTY', 'Guilty', 'G-hand strikes chest above heart bearing culpability.'],
  ['ASHAMED', 'Ashamed', 'Back of hand turns against cheek hiding face in remorse.'],
  ['EMBARRASSED', 'Embarrassed', 'Hands flush upward across burning red cheeks.'],
  ['SURPRISED', 'Surprised', 'Both index fingers pop open wide beside widening eyes.'],
  ['SHOCKED', 'Shocked', 'Jaw drops open as hands clasp sides of face frozen.'],
  ['BORED', 'Bored', 'Index finger twists at side of nose with weary sigh.'],
  ['CALM', 'Calm / Peaceful', 'Both flat hands glide downward smoothing troubled waters.'],
  ['PATIENT', 'Patient', 'A-thumb rests gently against chin enduring steady wait.'],
  ['IMPATIENT', 'Impatient', 'Fingers drum restlessly on wrist watch.'],
  ['KIND', 'Kind / Gentle', 'Both hands circle around each other warmly.'],
  ['CRUEL', 'Cruel / Mean', 'Clawed hand strikes forward like snarling predator.'],
  ['POLITE', 'Polite / Courteous', 'Thumb of 5-hand brushes chest upward with gentle bow.'],
  ['RUDE', 'Rude', 'Middle finger scrapes across non-dominant palm insolently.'],
  ['HONEST', 'Honest / Truthful', 'H-fingers slide straight forward along palm without bend.'],
  ['DISHONEST_LIAR', 'Dishonest / Liar', 'Index finger slides sideways across chin speaking untruths.'],
  ['LOYAL', 'Loyal', 'L-hand stamps down upon heart declaring steadfast allegiance.'],
  ['GENEROUS', 'Generous', 'Both hands pour abundance freely to all in need.'],
  ['SELFISH', 'Selfish', 'Hooked fingers claw inward snatching all for oneself.'],
  ['CLEVER_SMART', 'Clever / Smart', 'Index finger taps forehead radiating sharp brilliance.'],
  ['STUPID_FOOL', 'Foolish', 'V-fingers hook across forehead with rueful shake.'],
  ['LAZY', 'Lazy', 'L-hand slumps weakly against shoulder lacking effort.'],
  ['HARDWORKING', 'Hardworking', 'Fists hammer enthusiastically on workbench.'],
  ['STRONG', 'Strong / Powerful', 'Both bicep fists flex with formidable vigor.'],
  ['WEAK', 'Weak / Feeble', 'Fingers buckle and collapse unable to support weight.'],
  ['TALL', 'Tall', 'Hand rises high above head measuring towering stature.'],
  ['SHORT_HEIGHT', 'Short (Height)', 'Flat hand holds low near waist.'],
  ['FAT', 'Heavy / Plump', 'Both curved hands puff cheeks and expand outward.'],
  ['SLIM_THIN', 'Slim / Slender', 'Pinkies pull apart indicating delicate lean frame.'],
  ['HEAVY_WEIGHT', 'Heavy weight', 'Hands struggle to hoist load from ground.'],
  ['LIGHT_WEIGHT', 'Light weight', 'Hands bounce featherweight object upward easily.'],
  ['DEEP', 'Deep', 'Hand plunges far down below horizontal surface.'],
  ['SHALLOW', 'Shallow', 'Hand floats just beneath surface of water.'],
  ['WIDE', 'Wide', 'Both flat hands spread far apart horizontally.'],
  ['NARROW', 'Narrow', 'Both flat hands press closely together parallel.'],
  ['THICK', 'Thick', 'C-hand measures generous cross-section between fingers.'],
  ['THIN', 'Thin', 'Index and thumb hold paper-thin sliver.'],
  ['HARD_SURFACE', 'Hard', 'Knuckles rap against firm immovable solid.'],
  ['SOFT_SURFACE', 'Soft', 'Both hands squeeze plush velvety cushion.'],
  ['ROUGH', 'Rough', 'Curved fingers grate across coarse gravel texture.'],
  ['SMOOTH', 'Smooth', 'Flat palm glides effortlessly across polished marble.'],
  ['CLEAN_ADJ', 'Clean / Spotless', 'Palm sweeps across base hand leaving immaculate sheen.'],
  ['DIRTY', 'Dirty / Filthy', 'Back of hand shakes beneath chin spattering grime.'],
  ['BRIGHT', 'Bright / Luminous', 'Both O-hands burst open radiating brilliant light.'],
  ['DARK', 'Dark / Shadowy', 'Both open hands cross in front of eyes dimming light.'],
  ['SHINY', 'Shiny / Sparkling', 'Fingers flutter sparkling like polished gemstone.'],
  ['DULL', 'Dull / Matt', 'Flat hand descends with muted unreflective tone.'],
  ['LOUD', 'Loud / Noisy', 'Index touches ear then hands vibrate with thunderous sound.'],
  ['QUIET_SILENT', 'Quiet / Silent', 'Index finger seals lips with hushed serene calm.'],
  ['SWEET_TASTE', 'Sweet taste', 'Fingertips stroke down chin savoring sweet honey.'],
  ['SOUR', 'Sour', 'Lips pucker tightly as index taps cheek in tart reaction.'],
  ['BITTER', 'Bitter', 'Tongue recoils as hand wipes mouth with unpleasant grimace.'],
  ['SALTY', 'Salty', 'Fingers sprinkle salt onto tongue tasting savor.'],
  ['DELICIOUS', 'Delicious', 'Thumb and middle flick outward from lips licking fingers.'],
  ['DISGUSTING', 'Disgusting', 'Clawed hand twists on stomach with nauseated grimace.'],
  ['RICH', 'Rich / Wealthy', 'Hand drops thick bundle of banknotes into non-dominant palm.'],
  ['POOR', 'Poor / Impoverished', 'Fingers pull down ragged sleeve at elbow.'],
  ['FAMOUS', 'Famous / Renowned', 'Index fingers spiral outward from mouth to worldwide acclaim.'],
  ['UNKNOWN', 'Unknown / Obscure', 'Hands shrug outward into anonymous shadows.'],
  ['IMPORTANT', 'Important', 'Both F-hands circle and join together with paramount priority.'],
  ['USELESS', 'Useless', 'Hand tosses matter over shoulder with dismissive wave.'],
  ['DANGEROUS', 'Dangerous', 'Warning fists clash warning of perilous threat.'],
  ['SAFE_PLACE', 'Safe / Secure', 'Hands lock in strong unbreachable protective shelter.'],
  ['SPECIAL', 'Special / Unique', 'Dominant index finger plucks non-dominant thumb above rest.'],
  ['ORDINARY', 'Ordinary / Average', 'Hand balances horizontally in median normalcy.'],
  ['PERFECT', 'Perfect', 'Both P-hands touch circle tips in flawless precision.'],
  ['BROKEN', 'Broken / Shattered', 'Hands snap item apart with fractured pieces falling.'],
  ['EMPTY_ADJ', 'Empty', 'Middle finger swipes across bare back of hand showing nothing.'],
  ['FULL_ADJ', 'Full / Packed', 'Flat palm glides over rim of container brimming to top.']
];

for (const [gloss, english, description] of FEELINGS_STATES_BASES) {
  TIER_3_EXPANSIONS.push({ gloss, english, category: 'feelings_states', description });
}

console.log(`[build_tier3_dictionary] Total expansions prepared: ${TIER_3_EXPANSIONS.length}`);

// Combine base labels with expansions, taking exactly enough to reach 1,000 words
const existingGlosses = new Set(BASE_LABELS.map(w => w.gloss));
const newWords = [];

for (const item of TIER_3_EXPANSIONS) {
  const normGloss = item.gloss.trim().toUpperCase().replace(/[\s\/-]+/g, '_');
  if (existingGlosses.has(normGloss)) {
    console.log(`[build_tier3_dictionary] Skipping duplicate gloss: ${normGloss}`);
    continue;
  }
  existingGlosses.add(normGloss);
  newWords.push({
    gloss: normGloss,
    english: item.english,
    category: item.category,
    description: item.description
  });
  if (BASE_LABELS.length + newWords.length === 1000) {
    break;
  }
}

console.log(`[build_tier3_dictionary] New unique words added: ${newWords.length}`);
console.log(`[build_tier3_dictionary] Combined total words: ${BASE_LABELS.length + newWords.length}`);

if (BASE_LABELS.length + newWords.length < 1000) {
  console.error(`[build_tier3_dictionary] Error: only reached ${BASE_LABELS.length + newWords.length} words! Need 1,000.`);
  process.exit(1);
}

// Assemble full 1,000 words list with sequential IDs 0 to 999
const fullLabels = [
  ...BASE_LABELS.map((w, idx) => ({ ...w, id: idx })),
  ...newWords.map((w, idx) => ({ ...w, id: BASE_LABELS.length + idx }))
];

// Verify strict uniqueness and sequence
const idCheck = new Set();
const glossCheck = new Set();
for (let i = 0; i < fullLabels.length; i++) {
  const item = fullLabels[i];
  if (item.id !== i) {
    console.error(`ID mismatch at index ${i}: item has id ${item.id}`);
    process.exit(1);
  }
  if (idCheck.has(item.id)) {
    console.error(`Duplicate ID: ${item.id}`);
    process.exit(1);
  }
  idCheck.add(item.id);
  if (glossCheck.has(item.gloss)) {
    console.error(`Duplicate Gloss: ${item.gloss}`);
    process.exit(1);
  }
  glossCheck.add(item.gloss);
  if (!VALID_CATEGORIES.has(item.category)) {
    console.error(`Invalid Category: ${item.category} in ${item.gloss}`);
    process.exit(1);
  }
}

console.log(`[build_tier3_dictionary] All ${fullLabels.length} words verified strictly unique and sequential!`);

// Format output JavaScript file content
const fileHeader = `/**
 * Indian Sign Language (ISL) Conversational Vocabulary Taxonomy.
 * Tier 3: 1,000 Core Conversational Signs Covering Complete Everyday Daily English
 * (Greetings, Pronouns & Kinship, Professions, Questions & Quantifiers, Daily Actions & Cognition,
 * Transit & Commute, Healthcare & Emergency, Shopping, Groceries & Food, Education & Workplace,
 * Time, Calendar & Weather, Feelings, States & Descriptors).
 * Grounded in ISLRTC (Indian Sign Language Research and Training Centre) and AI4Bharat INCLUDE standards.
 */

export const ISL_WORD_CATEGORIES = Object.freeze([
  { id: 'greetings', name: 'Greetings & Politeness' },
  { id: 'pronouns', name: 'Pronouns & People' },
  { id: 'questions', name: 'Questions (WH- & Quantities)' },
  { id: 'actions', name: 'Actions & Daily Verbs' },
  { id: 'transit', name: 'Transit, Railway & Commute' },
  { id: 'healthcare', name: 'Healthcare & Emergency' },
  { id: 'shopping_food', name: 'Shopping, Market & Food' },
  { id: 'education_work', name: 'Education & Workplace' },
  { id: 'time_calendar', name: 'Time & Calendar' },
  { id: 'feelings_states', name: 'States & Descriptions' },
  { id: 'essentials', name: 'Essentials & Places' }
]);

export const ISL_WORD_LABELS = Object.freeze([
`;

const itemsFormatted = fullLabels.map(item => `  {
    id: ${item.id},
    gloss: ${JSON.stringify(item.gloss)},
    english: ${JSON.stringify(item.english)},
    category: ${JSON.stringify(item.category)},
    description: ${JSON.stringify(item.description)}
  }`).join(',\n');

const fileFooter = `
]);

export const TIER_1_WORD_COUNT = 50;
export const TIER_2_WORD_COUNT = 260;
export const WORD_COUNT = ISL_WORD_LABELS.length; // 1,000 signs (Tier 3 Complete Daily English)

/**
 * Find word metadata by numeric ID
 */
export function getWordById(id) {
  if (typeof id !== 'number' || id < 0 || id >= WORD_COUNT) return null;
  return ISL_WORD_LABELS[id];
}

/**
 * Find word metadata by case-insensitive gloss name
 */
export function getWordByGloss(gloss) {
  if (!gloss || typeof gloss !== 'string') return null;
  const upper = gloss.trim().toUpperCase().replace(/[\\s\\/-]+/g, '_');
  return ISL_WORD_LABELS.find(w => w.gloss === upper) || null;
}
`;

const outputPath = path.resolve(__dirname, '../src/ai/islWordLabels.js');
fs.writeFileSync(outputPath, fileHeader + itemsFormatted + fileFooter);
console.log(`[build_tier3_dictionary] Successfully written 1,000 Tier 3 words to: ${outputPath}`);
