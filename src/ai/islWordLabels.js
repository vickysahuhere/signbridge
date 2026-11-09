/**
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
  {
    id: 0,
    gloss: "HELLO",
    english: "Hello / Namaste",
    category: "greetings",
    description: "Palms pressed together at chest level in traditional Namaste posture, or open palm waved gently near forehead."
  },
  {
    id: 1,
    gloss: "GOOD_MORNING",
    english: "Good Morning",
    category: "greetings",
    description: "Thumbs-up moving forward followed by dominant hand rising upward like the morning sun."
  },
  {
    id: 2,
    gloss: "WELCOME",
    english: "Welcome",
    category: "greetings",
    description: "Both open palms held upward and swept inward toward the chest welcomingly."
  },
  {
    id: 3,
    gloss: "THANK_YOU",
    english: "Thank You",
    category: "greetings",
    description: "Fingertips of dominant flat hand touch chin and extend outward towards text partner."
  },
  {
    id: 4,
    gloss: "PLEASE",
    english: "Please",
    category: "greetings",
    description: "Open flat hand rubs in a circular clockwise motion over the center of the chest."
  },
  {
    id: 5,
    gloss: "SORRY",
    english: "Sorry",
    category: "greetings",
    description: "Closed fist with thumb extended rotates gently in a circular motion over heart."
  },
  {
    id: 6,
    gloss: "I_ME",
    english: "I / Me",
    category: "pronouns",
    description: "Index finger of dominant hand points directly to the center of the chest."
  },
  {
    id: 7,
    gloss: "YOU",
    english: "You",
    category: "pronouns",
    description: "Index finger of dominant hand points directly forward towards conversational partner."
  },
  {
    id: 8,
    gloss: "WE",
    english: "We / Us",
    category: "pronouns",
    description: "Dominant index finger arcs in an expansive horizontal semi-circle from signer around to front."
  },
  {
    id: 9,
    gloss: "THEY",
    english: "They / Them",
    category: "pronouns",
    description: "Dominant hand gestures outward with sweeping motion towards third-party direction."
  },
  {
    id: 10,
    gloss: "WHAT",
    english: "What",
    category: "questions",
    description: "Both palms held face up at waist level, oscillating side to side with furrowed eyebrows."
  },
  {
    id: 11,
    gloss: "WHERE",
    english: "Where",
    category: "questions",
    description: "Dominant index finger extended upright, wiggling side to side interrogatively."
  },
  {
    id: 12,
    gloss: "WHO",
    english: "Who",
    category: "questions",
    description: "Dominant index finger circles near the mouth or chin with questioning facial expression."
  },
  {
    id: 13,
    gloss: "WHY",
    english: "Why",
    category: "questions",
    description: "Dominant hand touches forehead with open fingers and draws back into a Y-handshape."
  },
  {
    id: 14,
    gloss: "WHEN",
    english: "When",
    category: "questions",
    description: "Dominant index finger circles around the tip of the non-dominant upright index finger."
  },
  {
    id: 15,
    gloss: "HOW",
    english: "How",
    category: "questions",
    description: "Backs of curved hands touch and roll upward and outward so palms face up."
  },
  {
    id: 16,
    gloss: "HELP",
    english: "Help",
    category: "actions",
    description: "Dominant fist rests thumbs-up on non-dominant open flat palm, lifting together upward."
  },
  {
    id: 17,
    gloss: "EAT",
    english: "Eat",
    category: "actions",
    description: "Fingertips brought together in pinched handshape and moved repeatedly toward mouth."
  },
  {
    id: 18,
    gloss: "DRINK",
    english: "Drink",
    category: "actions",
    description: "Dominant hand forms a cupped C-shape tilted upward at mouth as if drinking from a glass."
  },
  {
    id: 19,
    gloss: "GO",
    english: "Go",
    category: "actions",
    description: "Both index fingers point forward and arc outward away from signer in directional motion."
  },
  {
    id: 20,
    gloss: "COME",
    english: "Come",
    category: "actions",
    description: "Both open or index hands beckon inward toward signer’s chest."
  },
  {
    id: 21,
    gloss: "STOP",
    english: "Stop",
    category: "actions",
    description: "Dominant open flat hand chops down decisively onto non-dominant flat horizontal palm."
  },
  {
    id: 22,
    gloss: "UNDERSTAND",
    english: "Understand",
    category: "actions",
    description: "Dominant index finger flicks upward from curled fist near forehead (lightbulb moment)."
  },
  {
    id: 23,
    gloss: "KNOW",
    english: "Know",
    category: "actions",
    description: "Fingertips of dominant bent flat hand tap the temple twice."
  },
  {
    id: 24,
    gloss: "WANT",
    english: "Want",
    category: "actions",
    description: "Both curved claw hands with palms up pull inward towards the chest."
  },
  {
    id: 25,
    gloss: "LIKE",
    english: "Like",
    category: "actions",
    description: "Thumb and middle finger pull outward from center of chest, closing together."
  },
  {
    id: 26,
    gloss: "WORK",
    english: "Work",
    category: "actions",
    description: "Dominant fist taps wrists against non-dominant fist repeatedly."
  },
  {
    id: 27,
    gloss: "SLEEP",
    english: "Sleep",
    category: "actions",
    description: "Open hand held over face draws downward while closing fingers and tilting head slightly."
  },
  {
    id: 28,
    gloss: "READ",
    english: "Read",
    category: "actions",
    description: "Dominant V-fingers scan up and down across flat non-dominant palm like eyes reading a page."
  },
  {
    id: 29,
    gloss: "WRITE",
    english: "Write",
    category: "actions",
    description: "Dominant pinched fingers mimic holding a pen and writing across flat non-dominant palm."
  },
  {
    id: 30,
    gloss: "SIT",
    english: "Sit",
    category: "actions",
    description: "Dominant curved index and middle fingers hook down across non-dominant horizontal fingers."
  },
  {
    id: 31,
    gloss: "STAND",
    english: "Stand",
    category: "actions",
    description: "Dominant inverted V-fingers stand upright on the flat non-dominant palm."
  },
  {
    id: 32,
    gloss: "SEE",
    english: "See / Look",
    category: "actions",
    description: "Dominant V-fingers point from eyes forward in viewing direction."
  },
  {
    id: 33,
    gloss: "HEAR",
    english: "Hear / Listen",
    category: "actions",
    description: "Dominant index finger taps or points to ear."
  },
  {
    id: 34,
    gloss: "WATER",
    english: "Water",
    category: "essentials",
    description: "Dominant W-handshape or cupped index finger taps side of chin twice."
  },
  {
    id: 35,
    gloss: "FOOD",
    english: "Food",
    category: "essentials",
    description: "Pinched dominant handshape taps lips twice."
  },
  {
    id: 36,
    gloss: "HOME",
    english: "Home",
    category: "essentials",
    description: "Fingertips of both flat hands join at apex above chest to form roof-shaped triangle."
  },
  {
    id: 37,
    gloss: "SCHOOL",
    english: "School",
    category: "essentials",
    description: "Flat dominant hand claps down onto flat non-dominant palm twice horizontally."
  },
  {
    id: 38,
    gloss: "HOSPITAL",
    english: "Hospital",
    category: "essentials",
    description: "Dominant index and middle fingers trace cross shape on non-dominant upper arm or forehead."
  },
  {
    id: 39,
    gloss: "DOCTOR",
    english: "Doctor",
    category: "essentials",
    description: "Dominant index and middle fingers tap pulse point on non-dominant wrist."
  },
  {
    id: 40,
    gloss: "POLICE",
    english: "Police",
    category: "essentials",
    description: "Dominant C-handshape taps chest badge position twice."
  },
  {
    id: 41,
    gloss: "TOILET",
    english: "Toilet / Restroom",
    category: "essentials",
    description: "Dominant T-handshape (thumb tucked between index and middle) shakes gently side-to-side."
  },
  {
    id: 42,
    gloss: "YES",
    english: "Yes",
    category: "essentials",
    description: "Dominant fist nods up and down from wrist like a nodding head."
  },
  {
    id: 43,
    gloss: "NO",
    english: "No",
    category: "essentials",
    description: "Dominant index and middle fingers snap down against thumb."
  },
  {
    id: 44,
    gloss: "PAIN",
    english: "Pain / Hurt",
    category: "essentials",
    description: "Both index fingers point at each other and jab inward with twisting motion."
  },
  {
    id: 45,
    gloss: "MEDICINE",
    english: "Medicine",
    category: "essentials",
    description: "Dominant middle finger rubs center of non-dominant palm like grinding a mortar/pill."
  },
  {
    id: 46,
    gloss: "BOOK",
    english: "Book",
    category: "essentials",
    description: "Flat open hands clap palms together twice in horizontal orientation."
  },
  {
    id: 47,
    gloss: "NAME",
    english: "Name",
    category: "essentials",
    description: "Index and middle fingers of both H-hands tap across each other twice."
  },
  {
    id: 48,
    gloss: "FRIEND",
    english: "Friend",
    category: "essentials",
    description: "Both hooked index fingers interlock together, then flip and hook the opposite way."
  },
  {
    id: 49,
    gloss: "FAMILY",
    english: "Family",
    category: "essentials",
    description: "Both F-handshapes with index and thumb circles touching trace outward circle until pinkies touch."
  },
  {
    id: 50,
    gloss: "GOOD_AFTERNOON",
    english: "Good Afternoon",
    category: "greetings",
    description: "Thumbs-up followed by dominant flat hand held horizontal near forehead level symbolizing overhead sun."
  },
  {
    id: 51,
    gloss: "GOOD_EVENING",
    english: "Good Evening",
    category: "greetings",
    description: "Thumbs-up followed by dominant curved hand lowering downward over horizontal wrist like setting sun."
  },
  {
    id: 52,
    gloss: "GOOD_NIGHT",
    english: "Good Night",
    category: "greetings",
    description: "Thumbs-up followed by dominant hand sweeping across front with fingers closing like evening darkness."
  },
  {
    id: 53,
    gloss: "EXCUSE_ME",
    english: "Excuse Me",
    category: "greetings",
    description: "Dominant curved fingers brush lightly across flat non-dominant palm towards wrist."
  },
  {
    id: 54,
    gloss: "CONGRATULATIONS",
    english: "Congratulations",
    category: "greetings",
    description: "Both hands raised above shoulders clapping or waving side to side in joyous celebration."
  },
  {
    id: 55,
    gloss: "GOODBYE",
    english: "Goodbye",
    category: "greetings",
    description: "Open flat hand raised at shoulder level waving side to side or folding fingers downward."
  },
  {
    id: 56,
    gloss: "HE_SHE",
    english: "He / She / They",
    category: "pronouns",
    description: "Index finger points toward the side indicating a third person."
  },
  {
    id: 57,
    gloss: "MY_MINE",
    english: "My / Mine",
    category: "pronouns",
    description: "Flat open palm rests firmly against center of chest."
  },
  {
    id: 58,
    gloss: "YOUR_YOURS",
    english: "Your / Yours",
    category: "pronouns",
    description: "Flat open palm pushed gently forward towards conversation partner."
  },
  {
    id: 59,
    gloss: "OUR",
    english: "Our / Ours",
    category: "pronouns",
    description: "Curved open hand sweeps from dominant chest side across to non-dominant shoulder."
  },
  {
    id: 60,
    gloss: "THEIR",
    english: "Their / Theirs",
    category: "pronouns",
    description: "Flat open palm pushed towards side indicating third-party possession."
  },
  {
    id: 61,
    gloss: "MOTHER",
    english: "Mother / Mom",
    category: "pronouns",
    description: "Thumb of open dominant hand touches chin twice, or finger touches nose-ring position."
  },
  {
    id: 62,
    gloss: "FATHER",
    english: "Father / Dad",
    category: "pronouns",
    description: "Thumb of open dominant hand touches forehead twice, or fingers stroke mustache line."
  },
  {
    id: 63,
    gloss: "BROTHER",
    english: "Brother",
    category: "pronouns",
    description: "Male sign (touch forehead) followed by index fingers rubbing side-by-side in parallel."
  },
  {
    id: 64,
    gloss: "SISTER",
    english: "Sister",
    category: "pronouns",
    description: "Female sign (touch chin/nose) followed by index fingers rubbing side-by-side in parallel."
  },
  {
    id: 65,
    gloss: "SON",
    english: "Son",
    category: "pronouns",
    description: "Male sign (touch forehead) followed by cradling handshape rocking gently."
  },
  {
    id: 66,
    gloss: "DAUGHTER",
    english: "Daughter",
    category: "pronouns",
    description: "Female sign (touch chin) followed by cradling handshape rocking gently."
  },
  {
    id: 67,
    gloss: "CHILD",
    english: "Child / Kid",
    category: "pronouns",
    description: "Flat hand held palm-down pats downward at knee height as if patting a child’s head."
  },
  {
    id: 68,
    gloss: "BABY",
    english: "Baby",
    category: "pronouns",
    description: "Both forearms crossed in front of chest rocking side-to-side in cradling motion."
  },
  {
    id: 69,
    gloss: "HUSBAND",
    english: "Husband",
    category: "pronouns",
    description: "Male forehead sign followed by hands clasping together in marital union."
  },
  {
    id: 70,
    gloss: "WIFE",
    english: "Wife",
    category: "pronouns",
    description: "Female chin sign followed by hands clasping together in marital union."
  },
  {
    id: 71,
    gloss: "TEACHER",
    english: "Teacher",
    category: "pronouns",
    description: "Both flattened O-hands pull outward from temples, followed by downward agent person sign."
  },
  {
    id: 72,
    gloss: "STUDENT",
    english: "Student",
    category: "pronouns",
    description: "Dominant hand draws knowledge from flat non-dominant palm to forehead, followed by agent sign."
  },
  {
    id: 73,
    gloss: "NURSE",
    english: "Nurse",
    category: "pronouns",
    description: "Dominant index and middle finger tap pulse or trace red cross on arm, with gentle nursing posture."
  },
  {
    id: 74,
    gloss: "PASSENGER",
    english: "Passenger / Traveler",
    category: "pronouns",
    description: "Travel/ride handshape followed by two flat hands moving downward indicating person."
  },
  {
    id: 75,
    gloss: "PERSON",
    english: "Person / Individual",
    category: "pronouns",
    description: "Both open flat hands move downward parallel to each other in front of torso."
  },
  {
    id: 76,
    gloss: "WHICH",
    english: "Which",
    category: "questions",
    description: "Both thumbs-up hands alternate moving up and down gently in balance scale motion."
  },
  {
    id: 77,
    gloss: "HOW_MUCH",
    english: "How Much / Price",
    category: "questions",
    description: "Dominant thumb rubs across tips of index and middle fingers in money query motion."
  },
  {
    id: 78,
    gloss: "HOW_MANY",
    english: "How Many",
    category: "questions",
    description: "Both hands held palm-up with fingers fluttering open rapidly from fists."
  },
  {
    id: 79,
    gloss: "WHOSE",
    english: "Whose",
    category: "questions",
    description: "Who sign combined with outward palm indicating possession."
  },
  {
    id: 80,
    gloss: "ANY",
    english: "Any / Anyone",
    category: "questions",
    description: "Dominant thumbs-up tilts outward and down horizontally."
  },
  {
    id: 81,
    gloss: "ALL",
    english: "All / Everyone",
    category: "questions",
    description: "Dominant hand traces wide circular loop and lands palm-down onto non-dominant palm."
  },
  {
    id: 82,
    gloss: "WAIT",
    english: "Wait / Hold on",
    category: "actions",
    description: "Both open hands held out with palms up, fingers wiggling gently."
  },
  {
    id: 83,
    gloss: "WALK",
    english: "Walk",
    category: "actions",
    description: "Both flat hands alternate stepping forward and backward like feet walking."
  },
  {
    id: 84,
    gloss: "RUN",
    english: "Run",
    category: "actions",
    description: "Both L-handshapes with index fingers hooking forward in quick sprinting motion."
  },
  {
    id: 85,
    gloss: "BUY",
    english: "Buy / Purchase",
    category: "actions",
    description: "Dominant flat hand held palm-up moves forward off flat non-dominant palm as if handing money."
  },
  {
    id: 86,
    gloss: "SELL",
    english: "Sell",
    category: "actions",
    description: "Both flattened O-hands pivot forward and outward from wrists repeatedly."
  },
  {
    id: 87,
    gloss: "PAY",
    english: "Pay / Payment",
    category: "actions",
    description: "Dominant index fingertip slides forward along center of flat non-dominant palm."
  },
  {
    id: 88,
    gloss: "GIVE",
    english: "Give / Offer",
    category: "actions",
    description: "Both cupped hands or flattened O-hands extend outward from chest toward recipient."
  },
  {
    id: 89,
    gloss: "TAKE",
    english: "Take / Receive",
    category: "actions",
    description: "Open hand reaches out and closes into a fist while pulling back towards chest."
  },
  {
    id: 90,
    gloss: "BRING",
    english: "Bring / Fetch",
    category: "actions",
    description: "Both open hands held palm up sweep from side towards the signer’s body."
  },
  {
    id: 91,
    gloss: "NEED",
    english: "Need / Must",
    category: "actions",
    description: "Dominant hooked index finger flexes downward sharply in front of chest."
  },
  {
    id: 92,
    gloss: "LOVE",
    english: "Love / Care",
    category: "actions",
    description: "Both fists crossed over heart firmly in embrace posture."
  },
  {
    id: 93,
    gloss: "THINK",
    english: "Think / Ponder",
    category: "actions",
    description: "Dominant index finger touches temple or draws small circle near forehead."
  },
  {
    id: 94,
    gloss: "REMEMBER",
    english: "Remember",
    category: "actions",
    description: "Dominant thumb touches forehead then drops down to touch non-dominant thumb."
  },
  {
    id: 95,
    gloss: "FORGET",
    english: "Forget",
    category: "actions",
    description: "Fingertips of dominant flat hand wipe across forehead from non-dominant to dominant side."
  },
  {
    id: 96,
    gloss: "LEARN",
    english: "Learn / Study",
    category: "actions",
    description: "Dominant hand grasps knowledge from non-dominant palm and places it against forehead."
  },
  {
    id: 97,
    gloss: "TEACH",
    english: "Teach / Guide",
    category: "actions",
    description: "Both flattened O-hands held at temples move outward forward twice."
  },
  {
    id: 98,
    gloss: "WAKE_UP",
    english: "Wake Up",
    category: "actions",
    description: "Pinched index and thumb at corners of eyes flick open wide to symbolize opening eyes."
  },
  {
    id: 99,
    gloss: "WASH",
    english: "Wash Hands / Body",
    category: "actions",
    description: "Both hands rub together vigorously as if lathering soap under running water."
  },
  {
    id: 100,
    gloss: "CLEAN",
    english: "Clean / Tidy",
    category: "actions",
    description: "Dominant flat palm brushes smoothly across non-dominant flat palm from heel to fingertips."
  },
  {
    id: 101,
    gloss: "COOK",
    english: "Cook / Prepare Food",
    category: "actions",
    description: "Dominant flat hand flips palm-down to palm-up on non-dominant palm like flipping roti/food."
  },
  {
    id: 102,
    gloss: "SPEAK",
    english: "Speak / Talk",
    category: "actions",
    description: "Dominant 4-fingers tap or oscillate near mouth moving outward in speech flow."
  },
  {
    id: 103,
    gloss: "LISTEN",
    english: "Listen",
    category: "actions",
    description: "Dominant cupped hand held behind ear leaning slightly forward."
  },
  {
    id: 104,
    gloss: "LOOK",
    english: "Look / Watch",
    category: "actions",
    description: "Dominant V-fingers point decisively towards object or person of interest."
  },
  {
    id: 105,
    gloss: "OPEN",
    english: "Open (Door / Window)",
    category: "actions",
    description: "Both flat hands with index edges touching swing outward like double doors opening."
  },
  {
    id: 106,
    gloss: "CLOSE",
    english: "Close (Door / Window)",
    category: "actions",
    description: "Both flat hands apart swing inward until index edges touch like doors closing."
  },
  {
    id: 107,
    gloss: "START",
    english: "Start / Begin",
    category: "actions",
    description: "Dominant index finger inserts between non-dominant index and middle fingers and twists like a key."
  },
  {
    id: 108,
    gloss: "FINISH",
    english: "Finish / Done",
    category: "actions",
    description: "Both open hands held with palms facing chest flick outward with palms turning down/out."
  },
  {
    id: 109,
    gloss: "MEET",
    english: "Meet / Gather",
    category: "actions",
    description: "Both upright index fingers approach each other until knuckles meet."
  },
  {
    id: 110,
    gloss: "CALL",
    english: "Call / Phone Call",
    category: "actions",
    description: "Dominant Y-handshape (thumb and pinky) held against ear and mouth like a telephone."
  },
  {
    id: 111,
    gloss: "SEND",
    english: "Send / Transmit",
    category: "actions",
    description: "Dominant curved hand sweeps forward off back of non-dominant hand opening outward."
  },
  {
    id: 112,
    gloss: "TRAVEL",
    english: "Travel / Journey",
    category: "actions",
    description: "Dominant curved V-fingers move forward in wavy zigzag path through the air."
  },
  {
    id: 113,
    gloss: "STAY",
    english: "Stay / Remain",
    category: "actions",
    description: "Both Y-handshapes press firmly downward in front of torso."
  },
  {
    id: 114,
    gloss: "CHANGE",
    english: "Change / Exchange",
    category: "actions",
    description: "Both hooked X-hands cross and rotate positions in front of chest."
  },
  {
    id: 115,
    gloss: "ASK",
    english: "Ask / Inquire",
    category: "actions",
    description: "Both flat hands pressed together in front of chest move forward towards partner in petition."
  },
  {
    id: 116,
    gloss: "ANSWER",
    english: "Answer / Reply",
    category: "actions",
    description: "Both index fingers at lips rotate outward and point towards conversation partner."
  },
  {
    id: 117,
    gloss: "LIVE",
    english: "Live / Reside",
    category: "actions",
    description: "Both L-handshapes or fists with thumbs upright move up chest smoothly."
  },
  {
    id: 118,
    gloss: "TRAIN",
    english: "Train / Railway",
    category: "transit",
    description: "Dominant H-fingers slide back and forth across non-dominant H-fingers mimicking train on tracks."
  },
  {
    id: 119,
    gloss: "BUS",
    english: "Bus",
    category: "transit",
    description: "Both hands mimic gripping large horizontal steering wheel turning side to side."
  },
  {
    id: 120,
    gloss: "AUTO_RICKSHAW",
    english: "Auto Rickshaw / Auto",
    category: "transit",
    description: "Both hands mimic gripping handlebars and revving accelerator with right wrist."
  },
  {
    id: 121,
    gloss: "TAXI",
    english: "Taxi / Cab",
    category: "transit",
    description: "Fingerspell T-A-X-I or tap car sign followed by pointing to roof meter."
  },
  {
    id: 122,
    gloss: "FLIGHT_AIRPLANE",
    english: "Flight / Airplane",
    category: "transit",
    description: "Dominant hand in ILY/airplane shape (thumb, index, pinky extended) glides forward and upward."
  },
  {
    id: 123,
    gloss: "BICYCLE",
    english: "Bicycle / Cycle",
    category: "transit",
    description: "Both fists circle forward alternately in front of chest mimicking foot pedals."
  },
  {
    id: 124,
    gloss: "MOTORCYCLE",
    english: "Motorcycle / Scooter",
    category: "transit",
    description: "Both fists grip handlebars with right wrist twisting downward revving engine."
  },
  {
    id: 125,
    gloss: "CAR",
    english: "Car / Vehicle",
    category: "transit",
    description: "Both fists hold imaginary steering wheel steering gently left and right."
  },
  {
    id: 126,
    gloss: "METRO",
    english: "Metro / Underground Train",
    category: "transit",
    description: "Dominant train sign gliding underneath horizontal flat non-dominant hand."
  },
  {
    id: 127,
    gloss: "STATION",
    english: "Station / Railway Station",
    category: "transit",
    description: "Train sign followed by flat hands demarcating designated platform area."
  },
  {
    id: 128,
    gloss: "PLATFORM",
    english: "Platform",
    category: "transit",
    description: "Flat open hands held horizontal moving outward indicating level boarding stage."
  },
  {
    id: 129,
    gloss: "TICKET",
    english: "Ticket / Pass",
    category: "transit",
    description: "Dominant curved index and middle fingers bite/punch edge of flat non-dominant palm."
  },
  {
    id: 130,
    gloss: "SEAT",
    english: "Seat / Berth",
    category: "transit",
    description: "Sit sign followed by flat hand demarcating seat boundary."
  },
  {
    id: 131,
    gloss: "LUGGAGE_BAG",
    english: "Luggage / Suitcase",
    category: "transit",
    description: "Dominant fist held at side lifting upward as if carrying heavy suitcase handle."
  },
  {
    id: 132,
    gloss: "DELAY",
    english: "Delay / Late Arrival",
    category: "transit",
    description: "Dominant flat hand inches forward hesitantly, or late sign tapping wrist."
  },
  {
    id: 133,
    gloss: "ARRIVE",
    english: "Arrive / Incoming",
    category: "transit",
    description: "Dominant flat hand swoops down and lands securely into non-dominant flat palm."
  },
  {
    id: 134,
    gloss: "DEPARTURE",
    english: "Departure / Leaving",
    category: "transit",
    description: "Dominant flat hand moves away from non-dominant hand accelerating forward."
  },
  {
    id: 135,
    gloss: "FAST",
    english: "Fast / Express",
    category: "transit",
    description: "Both index fingers flick back rapidly into fists like drawing gun hammers."
  },
  {
    id: 136,
    gloss: "SLOW",
    english: "Slow / Local",
    category: "transit",
    description: "Dominant flat hand slowly caresses up the back of non-dominant forearm."
  },
  {
    id: 137,
    gloss: "NEAR",
    english: "Near / Close By",
    category: "transit",
    description: "Dominant bent hand pats gently close to chest or non-dominant hand."
  },
  {
    id: 138,
    gloss: "FAR",
    english: "Far / Distant",
    category: "transit",
    description: "Dominant index finger points forward and arches far out into distance."
  },
  {
    id: 139,
    gloss: "ROAD",
    english: "Road / Highway",
    category: "transit",
    description: "Both flat hands with palms facing inward move forward parallel creating a street."
  },
  {
    id: 140,
    gloss: "MAP",
    english: "Map / Directions",
    category: "transit",
    description: "Both hands unfold imaginary sheet and trace route lines with index finger."
  },
  {
    id: 141,
    gloss: "DESTINATION",
    english: "Destination",
    category: "transit",
    description: "Index finger traces journey and plants firmly down on non-dominant palm."
  },
  {
    id: 142,
    gloss: "CANCEL",
    english: "Cancelled",
    category: "transit",
    description: "Dominant index finger slices a large X across flat non-dominant palm."
  },
  {
    id: 143,
    gloss: "CONFIRM",
    english: "Confirmed",
    category: "transit",
    description: "Dominant fist stamps firmly onto flat open palm like a verification stamp."
  },
  {
    id: 144,
    gloss: "ENTRY",
    english: "Entry / Entrance",
    category: "transit",
    description: "Dominant flat hand ducks under curved non-dominant hand moving inward."
  },
  {
    id: 145,
    gloss: "EXIT",
    english: "Exit / Way Out",
    category: "transit",
    description: "Dominant flat hand sweeps outward pointing towards exit opening."
  },
  {
    id: 146,
    gloss: "CLINIC",
    english: "Clinic / Dispensary",
    category: "healthcare",
    description: "Doctor sign followed by small building boundary sign."
  },
  {
    id: 147,
    gloss: "EMERGENCY",
    english: "Emergency / Urgent",
    category: "healthcare",
    description: "Dominant E-handshape shakes urgently side-to-side with tense expression."
  },
  {
    id: 148,
    gloss: "AMBULANCE",
    english: "Ambulance",
    category: "healthcare",
    description: "Open hand above head flashes open and closed mimicking revolving emergency siren light."
  },
  {
    id: 149,
    gloss: "TABLET_PILL",
    english: "Tablet / Pill",
    category: "healthcare",
    description: "Dominant index and thumb form small circle placing pill onto tongue."
  },
  {
    id: 150,
    gloss: "INJECTION",
    english: "Injection / Vaccine",
    category: "healthcare",
    description: "Dominant index and middle finger form syringe pressing thumb down onto upper arm."
  },
  {
    id: 151,
    gloss: "FEVER",
    english: "Fever / High Temperature",
    category: "healthcare",
    description: "Back of dominant hand rests against forehead feeling for fever heat."
  },
  {
    id: 152,
    gloss: "COUGH",
    english: "Cough",
    category: "healthcare",
    description: "Dominant fist coughs against mouth twice with arched back."
  },
  {
    id: 153,
    gloss: "COLD_SICK",
    english: "Cold / Sneezing",
    category: "healthcare",
    description: "Pinched index and thumb wipe nose pulling downward mimicking runny nose."
  },
  {
    id: 154,
    gloss: "HEADACHE",
    english: "Headache",
    category: "healthcare",
    description: "Both index fingers point at temples and twist inward with wincing facial expression."
  },
  {
    id: 155,
    gloss: "STOMACHACHE",
    english: "Stomachache",
    category: "healthcare",
    description: "Both hands clasp abdomen with grimacing expression circling gently."
  },
  {
    id: 156,
    gloss: "BLOOD",
    english: "Blood",
    category: "healthcare",
    description: "Red sign (finger stroke lower lip) followed by fingers trickling downward."
  },
  {
    id: 157,
    gloss: "BANDAGE",
    english: "Bandage / Dressing",
    category: "healthcare",
    description: "Both flat hands wrap around wrist or forearm in winding motion."
  },
  {
    id: 158,
    gloss: "DOCTOR_APPOINTMENT",
    english: "Doctor Appointment",
    category: "healthcare",
    description: "Doctor sign followed by tapping wrist watch and meeting sign."
  },
  {
    id: 159,
    gloss: "X_RAY",
    english: "X-Ray / Scan",
    category: "healthcare",
    description: "Fingerspell X followed by flat hands scanning up and down chest frame."
  },
  {
    id: 160,
    gloss: "TEST_REPORT",
    english: "Test / Medical Report",
    category: "healthcare",
    description: "Checkmark drawn in air followed by flat sheet reading gesture."
  },
  {
    id: 161,
    gloss: "REST",
    english: "Rest / Relax",
    category: "healthcare",
    description: "Both flat open hands crossed over chest resting calmly with relaxed shoulders."
  },
  {
    id: 162,
    gloss: "RECOVER",
    english: "Recover / Get Well",
    category: "healthcare",
    description: "Both hands with palms facing chest rise upward with renewed energetic strength."
  },
  {
    id: 163,
    gloss: "DANGER",
    english: "Danger / Threat",
    category: "healthcare",
    description: "Dominant thumb brushes back of non-dominant fist twice with alert facial expression."
  },
  {
    id: 164,
    gloss: "ACCIDENT",
    english: "Accident / Crash",
    category: "healthcare",
    description: "Both fists slam into each other knuckles first in collision motion."
  },
  {
    id: 165,
    gloss: "FIRE",
    english: "Fire / Blaze",
    category: "healthcare",
    description: "Both open hands flutter fingers upward alternating like flickering flames."
  },
  {
    id: 166,
    gloss: "HELP_EMERGENCY",
    english: "Emergency Help / SOS",
    category: "healthcare",
    description: "Both fists raised waving urgently side-to-side with wide eyes."
  },
  {
    id: 167,
    gloss: "SAFE",
    english: "Safe / Protected",
    category: "healthcare",
    description: "Both S-hands crossed at wrists uncross and move outward into secure upright stance."
  },
  {
    id: 168,
    gloss: "SICK",
    english: "Sick / Unwell",
    category: "healthcare",
    description: "Dominant middle finger touches forehead while non-dominant middle finger touches stomach."
  },
  {
    id: 169,
    gloss: "HEALTHY",
    english: "Healthy / Fit",
    category: "healthcare",
    description: "Both cupped hands pull outward from shoulders transforming into strong solid fists."
  },
  {
    id: 170,
    gloss: "ALLERGY",
    english: "Allergy",
    category: "healthcare",
    description: "Index finger touches nose and snaps away with sneeze-reaction shake."
  },
  {
    id: 171,
    gloss: "OPERATION",
    english: "Operation / Surgery",
    category: "healthcare",
    description: "Dominant A-thumb cuts deliberate scalpel line across center of non-dominant flat palm."
  },
  {
    id: 172,
    gloss: "PRESCRIPTION",
    english: "Prescription / Rx",
    category: "healthcare",
    description: "Pencil writing sign onto palm followed by medicine pill sign."
  },
  {
    id: 173,
    gloss: "PHARMACY",
    english: "Pharmacy / Chemist Shop",
    category: "healthcare",
    description: "Medicine sign (grinding middle finger in palm) followed by shop sign."
  },
  {
    id: 174,
    gloss: "WHEELCHAIR",
    english: "Wheelchair",
    category: "healthcare",
    description: "Both curved L-hands circle backwards beside hips mimicking wheelchair wheels."
  },
  {
    id: 175,
    gloss: "OXYGEN",
    english: "Oxygen / Mask",
    category: "healthcare",
    description: "Cupped C-hand holds over nose and mouth mimicking breathing oxygen mask."
  },
  {
    id: 176,
    gloss: "MILK",
    english: "Milk",
    category: "shopping_food",
    description: "Dominant fist squeezes and releases twice in milking gesture."
  },
  {
    id: 177,
    gloss: "TEA",
    english: "Tea / Chai",
    category: "shopping_food",
    description: "Dominant pinched F-hand dips up and down into non-dominant O-cup like a teabag."
  },
  {
    id: 178,
    gloss: "COFFEE",
    english: "Coffee",
    category: "shopping_food",
    description: "Dominant fist rotates in horizontal circular motion above non-dominant fist grinding beans."
  },
  {
    id: 179,
    gloss: "RICE",
    english: "Rice",
    category: "shopping_food",
    description: "Dominant cupped hand mimics scooping rice and bringing grains towards mouth."
  },
  {
    id: 180,
    gloss: "ROTI_BREAD",
    english: "Roti / Bread",
    category: "shopping_food",
    description: "Both palms clap and pat back-and-forth horizontally like shaping flatbread."
  },
  {
    id: 181,
    gloss: "VEGETABLES",
    english: "Vegetables",
    category: "shopping_food",
    description: "Dominant V-handshape twists index fingertip against cheek twice."
  },
  {
    id: 182,
    gloss: "FRUITS",
    english: "Fruits",
    category: "shopping_food",
    description: "Dominant F-handshape twists against cheek with bright smile."
  },
  {
    id: 183,
    gloss: "SUGAR",
    english: "Sugar",
    category: "shopping_food",
    description: "Dominant index and middle fingers stroke down chin twice sweet-tasting."
  },
  {
    id: 184,
    gloss: "SALT",
    english: "Salt",
    category: "shopping_food",
    description: "Dominant V-fingers rub thumb across tips mimicking sprinkling salt."
  },
  {
    id: 185,
    gloss: "OIL",
    english: "Oil / Cooking Oil",
    category: "shopping_food",
    description: "Dominant O-hand tilts over non-dominant palm dripping liquid."
  },
  {
    id: 186,
    gloss: "SHOP_STORE",
    english: "Shop / Store",
    category: "shopping_food",
    description: "Both flattened O-hands pivot forward from wrists twice presenting goods."
  },
  {
    id: 187,
    gloss: "MARKET",
    english: "Market / Bazaar",
    category: "shopping_food",
    description: "Shop sign followed by wide sweeping open palms depicting crowded market stalls."
  },
  {
    id: 188,
    gloss: "MONEY",
    english: "Money / Currency",
    category: "shopping_food",
    description: "Dominant thumb rubs across tips of index and middle fingers in cash gesture."
  },
  {
    id: 189,
    gloss: "CASH",
    english: "Cash Notes",
    category: "shopping_food",
    description: "Thumb peels imaginary paper banknotes off non-dominant palm."
  },
  {
    id: 190,
    gloss: "PRICE_COST",
    english: "Price / Cost",
    category: "shopping_food",
    description: "Dominant crooked index finger brushes up non-dominant flat palm."
  },
  {
    id: 191,
    gloss: "EXPENSIVE",
    english: "Expensive",
    category: "shopping_food",
    description: "Money sign thrown upward and outward opening hand with surprised facial expression."
  },
  {
    id: 192,
    gloss: "CHEAP",
    english: "Cheap / Affordable",
    category: "shopping_food",
    description: "Dominant flat hand brushes down non-dominant palm with downward gesture."
  },
  {
    id: 193,
    gloss: "CHANGE_COINS",
    english: "Change / Coins",
    category: "shopping_food",
    description: "Index and thumb form small coin circle tapped onto palm."
  },
  {
    id: 194,
    gloss: "DISCOUNT",
    english: "Discount / Sale",
    category: "shopping_food",
    description: "Flat hand held high pushes downward indicating reduced price level."
  },
  {
    id: 195,
    gloss: "BILL_RECEIPT",
    english: "Bill / Receipt",
    category: "shopping_food",
    description: "Both hands pull imaginary long paper receipt from hands tearing it off."
  },
  {
    id: 196,
    gloss: "BAG",
    english: "Shopping Bag",
    category: "shopping_food",
    description: "Curved fingers mimic gripping grocery bag handles."
  },
  {
    id: 197,
    gloss: "CLOTHES",
    english: "Clothes / Shirt",
    category: "shopping_food",
    description: "Both open hands brush thumbs down chest shirt fabric twice."
  },
  {
    id: 198,
    gloss: "SHOES",
    english: "Shoes / Footwear",
    category: "shopping_food",
    description: "Both S-fists tap index finger sides together twice horizontally."
  },
  {
    id: 199,
    gloss: "SOAP",
    english: "Soap",
    category: "shopping_food",
    description: "Dominant flat hand rubs circular lather onto non-dominant palm."
  },
  {
    id: 200,
    gloss: "WATER_BOTTLE",
    english: "Water Bottle",
    category: "shopping_food",
    description: "Water sign followed by hands tracing cylindrical bottle shape."
  },
  {
    id: 201,
    gloss: "HOT",
    english: "Hot / Spicy / Warm",
    category: "shopping_food",
    description: "Curved claw hand at mouth twists quickly outward as if reacting to hot food."
  },
  {
    id: 202,
    gloss: "COLD_TEMP",
    english: "Cold (Temperature)",
    category: "shopping_food",
    description: "Both fists held near chest shivering side-to-side with hunched posture."
  },
  {
    id: 203,
    gloss: "HUNGRY",
    english: "Hungry",
    category: "shopping_food",
    description: "Dominant C-hand slides downward along center of chest from throat to stomach."
  },
  {
    id: 204,
    gloss: "THIRSTY",
    english: "Thirsty",
    category: "shopping_food",
    description: "Dominant index finger traces down throat indicating dry esophagus."
  },
  {
    id: 205,
    gloss: "SWEET",
    english: "Sweet",
    category: "shopping_food",
    description: "Fingertips of dominant hand stroke down chin twice with pleasant expression."
  },
  {
    id: 206,
    gloss: "SPICY",
    english: "Spicy / Hot Mirchi",
    category: "shopping_food",
    description: "Open hand waves in front of open mouth as if fanning tongue heat."
  },
  {
    id: 207,
    gloss: "FRESH",
    english: "Fresh",
    category: "shopping_food",
    description: "Both open hands rise upward in front of chest opening fingers refreshed."
  },
  {
    id: 208,
    gloss: "BREAKFAST",
    english: "Breakfast",
    category: "shopping_food",
    description: "Morning sign followed by eat sign."
  },
  {
    id: 209,
    gloss: "LUNCH",
    english: "Lunch",
    category: "shopping_food",
    description: "Afternoon / Noon sign followed by eat sign."
  },
  {
    id: 210,
    gloss: "DINNER",
    english: "Dinner",
    category: "shopping_food",
    description: "Night sign followed by eat sign."
  },
  {
    id: 211,
    gloss: "RESTAURANT",
    english: "Restaurant / Hotel",
    category: "shopping_food",
    description: "Dominant R-handshape strokes down corners of mouth twice."
  },
  {
    id: 212,
    gloss: "COLLEGE",
    english: "College / University",
    category: "education_work",
    description: "Dominant flat hand circles upward off flat non-dominant palm in higher education arc."
  },
  {
    id: 213,
    gloss: "OFFICE",
    english: "Office",
    category: "education_work",
    description: "Both O-hands demarcate four wall corners of a room."
  },
  {
    id: 214,
    gloss: "CLASSROOM",
    english: "Classroom",
    category: "education_work",
    description: "Class sign (C-hands tracing circle) followed by room boundary."
  },
  {
    id: 215,
    gloss: "PEN",
    english: "Pen",
    category: "education_work",
    description: "Dominant thumb clicks top of imaginary retractable pen."
  },
  {
    id: 216,
    gloss: "PENCIL",
    english: "Pencil",
    category: "education_work",
    description: "Dominant index and thumb lick tip and write on non-dominant palm."
  },
  {
    id: 217,
    gloss: "PAPER",
    english: "Paper",
    category: "education_work",
    description: "Dominant flat hand brushes backward twice against heel of non-dominant flat palm."
  },
  {
    id: 218,
    gloss: "NOTEBOOK",
    english: "Notebook",
    category: "education_work",
    description: "Book opening sign followed by writing gesture."
  },
  {
    id: 219,
    gloss: "COMPUTER",
    english: "Computer / Laptop",
    category: "education_work",
    description: "Both hands mimic typing briskly on keyboard in front of chest."
  },
  {
    id: 220,
    gloss: "INTERNET",
    english: "Internet / Wi-Fi",
    category: "education_work",
    description: "Both open 5-hands with middle fingertips touching rotate back and forth."
  },
  {
    id: 221,
    gloss: "PHONE",
    english: "Phone / Mobile",
    category: "education_work",
    description: "Dominant fist held against ear or thumb swiping smartphone screen."
  },
  {
    id: 222,
    gloss: "EMAIL",
    english: "Email",
    category: "education_work",
    description: "Dominant index finger darts through curved non-dominant C-hand like mail through slot."
  },
  {
    id: 223,
    gloss: "EXAM_TEST",
    english: "Exam / Test",
    category: "education_work",
    description: "Both index fingers point straight down then curl into question hooks repeatedly."
  },
  {
    id: 224,
    gloss: "HOMEWORK",
    english: "Homework",
    category: "education_work",
    description: "Home sign followed by work sign."
  },
  {
    id: 225,
    gloss: "MEETING",
    english: "Meeting",
    category: "education_work",
    description: "Both open hands come together with all fingertips meeting at center."
  },
  {
    id: 226,
    gloss: "SALARY",
    english: "Salary / Wages",
    category: "education_work",
    description: "Flat open palm catches money sliding into palm from employer."
  },
  {
    id: 227,
    gloss: "JOB",
    english: "Job",
    category: "education_work",
    description: "Fingerspell J-O-B or work sign with firm affirmative nod."
  },
  {
    id: 228,
    gloss: "MANAGER_BOSS",
    english: "Manager / Boss",
    category: "education_work",
    description: "Dominant curved claw hand taps shoulder twice signifying insignia rank."
  },
  {
    id: 229,
    gloss: "COLLEAGUE",
    english: "Colleague",
    category: "education_work",
    description: "Work sign followed by friend/same sign."
  },
  {
    id: 230,
    gloss: "PROJECT",
    english: "Project",
    category: "education_work",
    description: "Dominant P-hand moves down non-dominant flat palm like reviewing blueprints."
  },
  {
    id: 231,
    gloss: "HOLIDAY",
    english: "Holiday / Vacation",
    category: "education_work",
    description: "Both open 5-hands hook thumbs into chest armpits relaxing casually."
  },
  {
    id: 232,
    gloss: "TIME",
    english: "Time / Clock",
    category: "time_calendar",
    description: "Dominant index finger taps non-dominant wrist watch point twice."
  },
  {
    id: 233,
    gloss: "TODAY",
    english: "Today",
    category: "time_calendar",
    description: "Both Y-hands or open cupped hands drop downward firmly twice in front of torso."
  },
  {
    id: 234,
    gloss: "TOMORROW",
    english: "Tomorrow",
    category: "time_calendar",
    description: "Dominant A-thumb touches cheek and arcs forward into the future."
  },
  {
    id: 235,
    gloss: "YESTERDAY",
    english: "Yesterday",
    category: "time_calendar",
    description: "Dominant A-thumb touches cheek and arcs backward over shoulder into the past."
  },
  {
    id: 236,
    gloss: "NOW",
    english: "Now / Currently",
    category: "time_calendar",
    description: "Both bent hands drop downward decisively in front of chest once."
  },
  {
    id: 237,
    gloss: "LATER",
    english: "Later",
    category: "time_calendar",
    description: "Dominant L-hand tilts index finger forward from wrist like clock hand advancing."
  },
  {
    id: 238,
    gloss: "MORNING",
    english: "Morning / AM",
    category: "time_calendar",
    description: "Dominant flat hand rises upward from non-dominant crook of arm like the rising sun."
  },
  {
    id: 239,
    gloss: "AFTERNOON",
    english: "Afternoon / Noon",
    category: "time_calendar",
    description: "Dominant flat hand rests forearm at 12 o’clock high on non-dominant palm."
  },
  {
    id: 240,
    gloss: "EVENING",
    english: "Evening",
    category: "time_calendar",
    description: "Dominant curved hand lowers downward over horizontal wrist like sun setting."
  },
  {
    id: 241,
    gloss: "NIGHT",
    english: "Night / PM",
    category: "time_calendar",
    description: "Dominant curved hand caps over horizontal non-dominant wrist like darkness enveloping."
  },
  {
    id: 242,
    gloss: "DAY",
    english: "Day",
    category: "time_calendar",
    description: "Dominant index finger arcs across sky from sunrise to sunset."
  },
  {
    id: 243,
    gloss: "WEEK",
    english: "Week",
    category: "time_calendar",
    description: "Dominant index finger slides forward across flat non-dominant palm like a 7-day row."
  },
  {
    id: 244,
    gloss: "MONTH",
    english: "Month",
    category: "time_calendar",
    description: "Dominant index finger slides down back of non-dominant index finger."
  },
  {
    id: 245,
    gloss: "YEAR",
    english: "Year",
    category: "time_calendar",
    description: "Dominant fist circles around non-dominant fist symbolizing one earth revolution."
  },
  {
    id: 246,
    gloss: "HOUR",
    english: "Hour",
    category: "time_calendar",
    description: "Dominant index finger rotates 360 degrees around flat non-dominant palm clock."
  },
  {
    id: 247,
    gloss: "MINUTE",
    english: "Minute",
    category: "time_calendar",
    description: "Dominant index finger ticks forward one notch on non-dominant palm."
  },
  {
    id: 248,
    gloss: "HAPPY",
    english: "Happy / Joyful",
    category: "feelings_states",
    description: "Both flat hands brush upward against chest repeatedly with upbeat facial expression."
  },
  {
    id: 249,
    gloss: "SAD",
    english: "Sad / Unhappy",
    category: "feelings_states",
    description: "Both open hands held with palms facing inward droop down over face."
  },
  {
    id: 250,
    gloss: "ANGRY",
    english: "Angry / Upset",
    category: "feelings_states",
    description: "Clawed hand pulls violently upward in front of face with stern expression."
  },
  {
    id: 251,
    gloss: "TIRED",
    english: "Tired / Exhausted",
    category: "feelings_states",
    description: "Fingertips placed on chest droop downward as shoulders collapse gently."
  },
  {
    id: 252,
    gloss: "BUSY",
    english: "Busy / Occupied",
    category: "feelings_states",
    description: "Dominant B-hand rubs briskly back and forth across non-dominant wrist."
  },
  {
    id: 253,
    gloss: "READY",
    english: "Ready / Prepared",
    category: "feelings_states",
    description: "Both R-hands sweep outward parallel from chest with decisive readiness."
  },
  {
    id: 254,
    gloss: "SURE",
    english: "Sure / Certain",
    category: "feelings_states",
    description: "Dominant index finger touches chin and moves firmly forward."
  },
  {
    id: 255,
    gloss: "MAYBE",
    english: "Maybe / Perhaps",
    category: "feelings_states",
    description: "Both flat palms facing up alternate up and down like weighing scales."
  },
  {
    id: 256,
    gloss: "CORRECT",
    english: "Correct / Right",
    category: "feelings_states",
    description: "Dominant index finger drops across non-dominant index finger in firm checkmark."
  },
  {
    id: 257,
    gloss: "WRONG",
    english: "Wrong / Error",
    category: "feelings_states",
    description: "Dominant Y-handshape touches middle knuckle against chin with frowning shake."
  },
  {
    id: 258,
    gloss: "BIG",
    english: "Big / Large",
    category: "feelings_states",
    description: "Both curved hands move far apart with puffed cheeks demonstrating massive size."
  },
  {
    id: 259,
    gloss: "SMALL",
    english: "Small / Tiny",
    category: "feelings_states",
    description: "Both flat palms held close together facing each other with squinted eyes."
  },
  {
    id: 260,
    gloss: "NAMASTE",
    english: "Namaste",
    category: "greetings",
    description: "Palms pressed together at chest level in traditional respectful greeting."
  },
  {
    id: 261,
    gloss: "GOOD_LUCK",
    english: "Good Luck",
    category: "greetings",
    description: "Thumbs up gesture moving outward with warm encouraging expression."
  },
  {
    id: 262,
    gloss: "BEST_WISHES",
    english: "Best Wishes",
    category: "greetings",
    description: "Both hands open moving forward with blessings motion."
  },
  {
    id: 263,
    gloss: "TAKE_CARE",
    english: "Take Care",
    category: "greetings",
    description: "Both K-hands tap crossed wrists in protective caretaking motion."
  },
  {
    id: 264,
    gloss: "NICE_TO_MEET_YOU",
    english: "Nice to meet you",
    category: "greetings",
    description: "Good sign followed by meet sign with pleasant smile."
  },
  {
    id: 265,
    gloss: "SEE_YOU_AGAIN",
    english: "See you again",
    category: "greetings",
    description: "See sign followed by again sign circling fingers."
  },
  {
    id: 266,
    gloss: "HAVE_A_GOOD_DAY",
    english: "Have a good day",
    category: "greetings",
    description: "Good sign followed by day sign arcing overhead."
  },
  {
    id: 267,
    gloss: "GOD_BLESS",
    english: "God Bless",
    category: "greetings",
    description: "Both open hands descend gently from forehead level in divine blessing."
  },
  {
    id: 268,
    gloss: "SORRY_TO_BOTHER",
    english: "Sorry to bother",
    category: "greetings",
    description: "Sorry sign followed by gentle excuse brush on palm."
  },
  {
    id: 269,
    gloss: "MY_PLEASURE",
    english: "My pleasure",
    category: "greetings",
    description: "Flat hand on heart rotating warmly with content smile."
  },
  {
    id: 270,
    gloss: "PARDON",
    english: "Pardon",
    category: "greetings",
    description: "Cupped hand to ear with questioning slight head tilt."
  },
  {
    id: 271,
    gloss: "CHEERS",
    english: "Cheers",
    category: "greetings",
    description: "Both hands hold imaginary glasses clinking together merrily."
  },
  {
    id: 272,
    gloss: "WELCOME_BACK",
    english: "Welcome back",
    category: "greetings",
    description: "Welcome gesture followed by return beckon towards chest."
  },
  {
    id: 273,
    gloss: "FAREWELL",
    english: "Farewell",
    category: "greetings",
    description: "Both flat hands wave gracefully from side to side in parting."
  },
  {
    id: 274,
    gloss: "PEACE",
    english: "Peace",
    category: "greetings",
    description: "Palms meet then glide smoothly outward horizontally in tranquil calmness."
  },
  {
    id: 275,
    gloss: "RESPECT",
    english: "Respect",
    category: "greetings",
    description: "Dominant R-hand touches forehead and extends forward honorably."
  },
  {
    id: 276,
    gloss: "HUMBLE",
    english: "Humble",
    category: "greetings",
    description: "Dominant index finger slides gently under non-dominant palm."
  },
  {
    id: 277,
    gloss: "GREETINGS_FORMAL",
    english: "Formal Greetings",
    category: "greetings",
    description: "Both hands sweep from shoulders outward in formal reception."
  },
  {
    id: 278,
    gloss: "GRANDFATHER",
    english: "Grandfather",
    category: "pronouns",
    description: "Father sign touching forehead bouncing forward one generation."
  },
  {
    id: 279,
    gloss: "GRANDMOTHER",
    english: "Grandmother",
    category: "pronouns",
    description: "Mother sign touching chin bouncing forward one generation."
  },
  {
    id: 280,
    gloss: "UNCLE",
    english: "Uncle",
    category: "pronouns",
    description: "U-handshape twists twice near the temple or cheek."
  },
  {
    id: 281,
    gloss: "AUNT",
    english: "Aunt",
    category: "pronouns",
    description: "A-handshape twists twice near the chin or jawline."
  },
  {
    id: 282,
    gloss: "COUSIN",
    english: "Cousin",
    category: "pronouns",
    description: "C-handshape shakes gently near side of temple."
  },
  {
    id: 283,
    gloss: "NEPHEW",
    english: "Nephew",
    category: "pronouns",
    description: "N-handshape twists near forehead level indicating young male."
  },
  {
    id: 284,
    gloss: "NIECE",
    english: "Niece",
    category: "pronouns",
    description: "N-handshape twists near jaw level indicating young female."
  },
  {
    id: 285,
    gloss: "IN_LAWS",
    english: "In-Laws",
    category: "pronouns",
    description: "Marriage clasp followed by L-handshape touching palm."
  },
  {
    id: 286,
    gloss: "FATHER_IN_LAW",
    english: "Father-in-law",
    category: "pronouns",
    description: "Father sign followed by legal law L-sign on palm."
  },
  {
    id: 287,
    gloss: "MOTHER_IN_LAW",
    english: "Mother-in-law",
    category: "pronouns",
    description: "Mother sign followed by legal law L-sign on palm."
  },
  {
    id: 288,
    gloss: "BROTHER_IN_LAW",
    english: "Brother-in-law",
    category: "pronouns",
    description: "Brother sign followed by legal law L-sign on palm."
  },
  {
    id: 289,
    gloss: "SISTER_IN_LAW",
    english: "Sister-in-law",
    category: "pronouns",
    description: "Sister sign followed by legal law L-sign on palm."
  },
  {
    id: 290,
    gloss: "TWINS",
    english: "Twins",
    category: "pronouns",
    description: "V-fingers touch chin and split into two identical people."
  },
  {
    id: 291,
    gloss: "NEIGHBOR",
    english: "Neighbor",
    category: "pronouns",
    description: "Home sign followed by near sign and person classifier."
  },
  {
    id: 292,
    gloss: "LANDLORD",
    english: "Landlord",
    category: "pronouns",
    description: "House sign followed by owner manager claw on shoulder."
  },
  {
    id: 293,
    gloss: "TENANT",
    english: "Tenant",
    category: "pronouns",
    description: "Rent sign followed by person descending indicator."
  },
  {
    id: 294,
    gloss: "GUEST",
    english: "Guest",
    category: "pronouns",
    description: "Welcome sign followed by person classifier."
  },
  {
    id: 295,
    gloss: "HOST",
    english: "Host",
    category: "pronouns",
    description: "Receive sign followed by manager person badge."
  },
  {
    id: 296,
    gloss: "PARENT",
    english: "Parents",
    category: "pronouns",
    description: "Combined mother (chin) and father (forehead) signs in smooth sequence."
  },
  {
    id: 297,
    gloss: "RELATIVES",
    english: "Relatives",
    category: "pronouns",
    description: "Both hooked index fingers interlink and chain outward."
  },
  {
    id: 298,
    gloss: "ANCESTORS",
    english: "Ancestors",
    category: "pronouns",
    description: "Hands cycle backward over shoulders into deep lineage."
  },
  {
    id: 299,
    gloss: "CHILDREN",
    english: "Children",
    category: "pronouns",
    description: "Both flat hands pat downward alternately at hip level."
  },
  {
    id: 300,
    gloss: "BOY",
    english: "Boy",
    category: "pronouns",
    description: "Fingers grip imaginary cap brim at forehead."
  },
  {
    id: 301,
    gloss: "GIRL",
    english: "Girl",
    category: "pronouns",
    description: "Thumb strokes jawline downwards towards chin."
  },
  {
    id: 302,
    gloss: "MAN",
    english: "Man",
    category: "pronouns",
    description: "Forehead cap sign followed by tall adult height indicator."
  },
  {
    id: 303,
    gloss: "WOMAN",
    english: "Woman",
    category: "pronouns",
    description: "Chin cheek sign followed by chest height indicator."
  },
  {
    id: 304,
    gloss: "ELDER",
    english: "Elderly Person",
    category: "pronouns",
    description: "Curved hand mimics walking cane with slow deliberate posture."
  },
  {
    id: 305,
    gloss: "YOUTH",
    english: "Youth",
    category: "pronouns",
    description: "Both hands brush upward from waist with energetic bounce."
  },
  {
    id: 306,
    gloss: "ADULT",
    english: "Adult",
    category: "pronouns",
    description: "Flat hand rises from chest to head height indicating maturity."
  },
  {
    id: 307,
    gloss: "CITIZEN",
    english: "Citizen",
    category: "pronouns",
    description: "Country sign followed by person descending hands."
  },
  {
    id: 308,
    gloss: "ENGINEER",
    english: "Engineer",
    category: "pronouns",
    description: "Interlocking Y-hands pivot like measuring gears, then person sign."
  },
  {
    id: 309,
    gloss: "SCIENTIST",
    english: "Scientist",
    category: "pronouns",
    description: "Both hands pour imaginary test tubes alternately, then person sign."
  },
  {
    id: 310,
    gloss: "LAWYER",
    english: "Lawyer",
    category: "pronouns",
    description: "L-hand taps non-dominant palm twice, then person sign."
  },
  {
    id: 311,
    gloss: "JUDGE",
    english: "Judge",
    category: "pronouns",
    description: "Fist gavel taps down firmly twice, then person sign."
  },
  {
    id: 312,
    gloss: "POLITICIAN",
    english: "Politician",
    category: "pronouns",
    description: "P-hand traces circle near temple with prominent stance."
  },
  {
    id: 313,
    gloss: "SOLDIER",
    english: "Soldier",
    category: "pronouns",
    description: "Both fists hold imaginary rifle across chest at attention."
  },
  {
    id: 314,
    gloss: "ARMY",
    english: "Army",
    category: "pronouns",
    description: "Salute followed by line of soldiers marching."
  },
  {
    id: 315,
    gloss: "NAVY",
    english: "Navy",
    category: "pronouns",
    description: "Water sign followed by boat gliding and sailor salute."
  },
  {
    id: 316,
    gloss: "PILOT",
    english: "Pilot",
    category: "pronouns",
    description: "Airplane handshape gliding forward, then person sign."
  },
  {
    id: 317,
    gloss: "DRIVER",
    english: "Driver",
    category: "pronouns",
    description: "Steering wheel turning motion, then person sign."
  },
  {
    id: 318,
    gloss: "CONDUCTOR",
    english: "Conductor",
    category: "pronouns",
    description: "Ticket punch click motion, then person sign."
  },
  {
    id: 319,
    gloss: "CHEF_COOK",
    english: "Chef / Cook",
    category: "pronouns",
    description: "Cooking stir motion followed by tall chef hat indicator."
  },
  {
    id: 320,
    gloss: "FARMER",
    english: "Farmer",
    category: "pronouns",
    description: "Agriculture plow motion across palm, then person sign."
  },
  {
    id: 321,
    gloss: "CARPENTER",
    english: "Carpenter",
    category: "pronouns",
    description: "Planer shaving wood back and forth, then person sign."
  },
  {
    id: 322,
    gloss: "PLUMBER",
    english: "Plumber",
    category: "pronouns",
    description: "Wrench twisting on pipe gesture, then person sign."
  },
  {
    id: 323,
    gloss: "ELECTRICIAN",
    english: "Electrician",
    category: "pronouns",
    description: "Both X-fingers spark together like electricity, then person sign."
  },
  {
    id: 324,
    gloss: "MECHANIC",
    english: "Mechanic",
    category: "pronouns",
    description: "Interlocked fingers gear turn, then tool tightening gesture."
  },
  {
    id: 325,
    gloss: "TAILOR",
    english: "Tailor",
    category: "pronouns",
    description: "Needle and thread stitching motion, then person sign."
  },
  {
    id: 326,
    gloss: "BARBER",
    english: "Barber / Hairdresser",
    category: "pronouns",
    description: "V-fingers snip like scissors near hair, then person sign."
  },
  {
    id: 327,
    gloss: "SECURITY_GUARD",
    english: "Security Guard",
    category: "pronouns",
    description: "Crossed arms shield chest firmly with alert eye scanning."
  },
  {
    id: 328,
    gloss: "CLEANER_SWEEPER",
    english: "Cleaner",
    category: "pronouns",
    description: "Sweeping broom motion across ground, then person sign."
  },
  {
    id: 329,
    gloss: "POSTMAN",
    english: "Postman",
    category: "pronouns",
    description: "Stamp lick onto envelope, then bag shoulder strap sign."
  },
  {
    id: 330,
    gloss: "DELIVERY_PERSON",
    english: "Delivery Person",
    category: "pronouns",
    description: "Carrying box forward and handing over with signature sign."
  },
  {
    id: 331,
    gloss: "SHOPKEEPER",
    english: "Shopkeeper",
    category: "pronouns",
    description: "Shop store sign followed by person classifier."
  },
  {
    id: 332,
    gloss: "CLERK",
    english: "Clerk",
    category: "pronouns",
    description: "Typing or writing on desk, then person sign."
  },
  {
    id: 333,
    gloss: "ACCOUNTANT",
    english: "Accountant",
    category: "pronouns",
    description: "Calculator tapping and money counting, then person sign."
  },
  {
    id: 334,
    gloss: "ARTIST",
    english: "Artist",
    category: "pronouns",
    description: "Brush painting on imaginary canvas, then person sign."
  },
  {
    id: 335,
    gloss: "PAINTER",
    english: "Painter",
    category: "pronouns",
    description: "Wide flat hand stroke on wall surface, then person sign."
  },
  {
    id: 336,
    gloss: "MUSICIAN",
    english: "Musician",
    category: "pronouns",
    description: "Playing instrument motion with rhythmic swaying."
  },
  {
    id: 337,
    gloss: "SINGER",
    english: "Singer",
    category: "pronouns",
    description: "V-fingers arc from mouth outward like singing voice, then person."
  },
  {
    id: 338,
    gloss: "ACTOR",
    english: "Actor",
    category: "pronouns",
    description: "Both thumbs-up rotate alternately towards chest, then person."
  },
  {
    id: 339,
    gloss: "WRITER_AUTHOR",
    english: "Writer / Author",
    category: "pronouns",
    description: "Pen writing on palm followed by book publication sign."
  },
  {
    id: 340,
    gloss: "JOURNALIST",
    english: "Journalist",
    category: "pronouns",
    description: "Holding microphone to speaker and taking notes."
  },
  {
    id: 341,
    gloss: "PHOTOGRAPHER",
    english: "Photographer",
    category: "pronouns",
    description: "Both hands click imaginary camera shutter, then person."
  },
  {
    id: 342,
    gloss: "PRIEST",
    english: "Priest / Clergy",
    category: "pronouns",
    description: "Prayer hands followed by holy thread or collar gesture."
  },
  {
    id: 343,
    gloss: "VOLUNTEER",
    english: "Volunteer",
    category: "pronouns",
    description: "Pinching shirt fabric at chest and lifting forward eagerly."
  },
  {
    id: 344,
    gloss: "ATHLETE",
    english: "Athlete / Sportsman",
    category: "pronouns",
    description: "Running sprinting posture with victorious fist pump."
  },
  {
    id: 345,
    gloss: "COACH",
    english: "Coach",
    category: "pronouns",
    description: "C-hand on shoulder with whistle blowing gesture."
  },
  {
    id: 346,
    gloss: "BOSS",
    english: "Boss / Executive",
    category: "pronouns",
    description: "Curved claw taps shoulder twice with authority."
  },
  {
    id: 347,
    gloss: "CLIENT",
    english: "Client / Customer",
    category: "pronouns",
    description: "Buying person exchanging payment with seller."
  },
  {
    id: 348,
    gloss: "PARTNER",
    english: "Partner",
    category: "pronouns",
    description: "Both index fingers hook together side by side."
  },
  {
    id: 349,
    gloss: "STRANGER",
    english: "Stranger",
    category: "pronouns",
    description: "Unknown sign followed by person gesture."
  },
  {
    id: 350,
    gloss: "DEAF_COMMUNITY",
    english: "Deaf Community",
    category: "pronouns",
    description: "Ear-to-mouth deaf sign followed by united group circle."
  },
  {
    id: 351,
    gloss: "HEARING_PERSON",
    english: "Hearing Person",
    category: "pronouns",
    description: "Index finger points to ear and circles forward in speech."
  },
  {
    id: 352,
    gloss: "WHEREVER",
    english: "Wherever",
    category: "questions",
    description: "Where sign swept across expansive horizontal arc."
  },
  {
    id: 353,
    gloss: "WHENEVER",
    english: "Whenever",
    category: "questions",
    description: "When sign followed by anytime outward shrug."
  },
  {
    id: 354,
    gloss: "WHATEVER",
    english: "Whatever",
    category: "questions",
    description: "Both palms up drop carelessly with casual shrug."
  },
  {
    id: 355,
    gloss: "WHOEVER",
    english: "Whoever",
    category: "questions",
    description: "Who sign combined with any person sweeping arc."
  },
  {
    id: 356,
    gloss: "HOWEVER",
    english: "However",
    category: "questions",
    description: "Both index fingers cross and flip direction."
  },
  {
    id: 357,
    gloss: "HOW_LONG",
    english: "How long (Time)",
    category: "questions",
    description: "Index finger traces along forearm from wrist to elbow."
  },
  {
    id: 358,
    gloss: "HOW_FAR",
    english: "How far (Distance)",
    category: "questions",
    description: "Index finger points forward measuring long distance with squint."
  },
  {
    id: 359,
    gloss: "HOW_OFTEN",
    english: "How often",
    category: "questions",
    description: "Index finger taps palm repeatedly counting occurrences."
  },
  {
    id: 360,
    gloss: "HOW_OLD",
    english: "How old (Age)",
    category: "questions",
    description: "Y-hand pulls down from chin like beard with questioning look."
  },
  {
    id: 361,
    gloss: "IS_IT",
    english: "Is it?",
    category: "questions",
    description: "Single affirmative nod paired with questioning raised eyebrows."
  },
  {
    id: 362,
    gloss: "CAN_YOU",
    english: "Can you?",
    category: "questions",
    description: "Both S-fists drop downward paired with questioning head tilt."
  },
  {
    id: 363,
    gloss: "MAY_I",
    english: "May I?",
    category: "questions",
    description: "Open flat hands held up petitioning gently forward."
  },
  {
    id: 364,
    gloss: "COULD_WE",
    english: "Could we?",
    category: "questions",
    description: "We circle followed by can fists dropping interrogatively."
  },
  {
    id: 365,
    gloss: "WHICH_ONE",
    english: "Which one?",
    category: "questions",
    description: "Index finger points alternately between two imaginary targets."
  },
  {
    id: 366,
    gloss: "SEVERAL",
    english: "Several",
    category: "questions",
    description: "Fingers roll open sequentially from fist like counting 4-5 items."
  },
  {
    id: 367,
    gloss: "FEW",
    english: "Few",
    category: "questions",
    description: "Thumb scrapes across tips of curled fingers in small quantity."
  },
  {
    id: 368,
    gloss: "MANY",
    english: "Many",
    category: "questions",
    description: "Both fists explode open repeatedly with wide eyes."
  },
  {
    id: 369,
    gloss: "MUCH",
    english: "Much",
    category: "questions",
    description: "Both curved claw hands hold large volume in front of chest."
  },
  {
    id: 370,
    gloss: "LITTLE_AMOUNT",
    english: "Little (Amount)",
    category: "questions",
    description: "Thumb and index hold tiny gap apart demonstrating scarcity."
  },
  {
    id: 371,
    gloss: "ENOUGH",
    english: "Enough",
    category: "questions",
    description: "Dominant flat hand pushes over top of non-dominant fist like overflowing."
  },
  {
    id: 372,
    gloss: "WHATEVER_HAPPENS",
    english: "Whatever happens",
    category: "questions",
    description: "Both hands sweep open with accepting resolute nod."
  },
  {
    id: 373,
    gloss: "AT_ANY_TIME",
    english: "At any time",
    category: "questions",
    description: "Time tap on wrist followed by open sweeping choice."
  },
  {
    id: 374,
    gloss: "STEP_BY_STEP",
    english: "Step by step / Gradually",
    category: "actions",
    description: "Hands step forward alternately in measured cadence."
  },
  {
    id: 375,
    gloss: "ROUND_TRIP",
    english: "Round trip ticket",
    category: "transit",
    description: "Journey arcs outward and curves back to home base."
  },
  {
    id: 376,
    gloss: "ONE_WAY",
    english: "One way ticket",
    category: "transit",
    description: "Index points straight to destination without returning loop."
  },
  {
    id: 377,
    gloss: "CHECK_IN",
    english: "Check-in counter",
    category: "transit",
    description: "Ticket presented at counter with baggage handed over."
  },
  {
    id: 378,
    gloss: "CHECK_OUT",
    english: "Check-out",
    category: "transit",
    description: "Keys handed back at desk completing hotel departure."
  },
  {
    id: 379,
    gloss: "BLOOD_BANK",
    english: "Blood bank",
    category: "healthcare",
    description: "Blood sign followed by refrigerated storage depot."
  },
  {
    id: 380,
    gloss: "PHARMACIST",
    english: "Pharmacist",
    category: "healthcare",
    description: "Medicine compounding gesture followed by person sign."
  },
  {
    id: 381,
    gloss: "SURGERY_ROOM",
    english: "Surgery room",
    category: "healthcare",
    description: "Sterile scalpel incision sign followed by room boundary."
  },
  {
    id: 382,
    gloss: "RECOVERY_ROOM",
    english: "Recovery room",
    category: "healthcare",
    description: "Healing recovery rise sign inside patient room."
  },
  {
    id: 383,
    gloss: "GROCERY_BAG",
    english: "Grocery bag",
    category: "shopping_food",
    description: "Handles of sturdy carry bag gripped walking from market."
  },
  {
    id: 384,
    gloss: "WATER_PURIFIER",
    english: "Water purifier / Filter",
    category: "shopping_food",
    description: "Water sign entering filter flowing out sparkling pure."
  },
  {
    id: 385,
    gloss: "STAINLESS_STEEL",
    english: "Stainless steel vessel",
    category: "shopping_food",
    description: "Silver shine across gleaming durable steel surface."
  },
  {
    id: 386,
    gloss: "OFFICE_DESK",
    english: "Office workstation",
    category: "education_work",
    description: "Computer desk with documents and ergonomic chair."
  },
  {
    id: 387,
    gloss: "WORK_FROM_HOME",
    english: "Work from home",
    category: "education_work",
    description: "Home sign followed by laptop typing work gesture."
  },
  {
    id: 388,
    gloss: "STAND_UP",
    english: "Stand up",
    category: "actions",
    description: "Inverted V-fingers rise swiftly to standing position."
  },
  {
    id: 389,
    gloss: "SIT_DOWN",
    english: "Sit down",
    category: "actions",
    description: "Hooked fingers drop decisively onto horizontal base."
  },
  {
    id: 390,
    gloss: "LIE_DOWN",
    english: "Lie down",
    category: "actions",
    description: "V-fingers flip flat onto non-dominant palm."
  },
  {
    id: 391,
    gloss: "CLIMB",
    english: "Climb",
    category: "actions",
    description: "Curved fingers step upward alternately as on a ladder."
  },
  {
    id: 392,
    gloss: "JUMP",
    english: "Jump",
    category: "actions",
    description: "V-fingers crouch and spring upward off palm."
  },
  {
    id: 393,
    gloss: "FALL",
    english: "Fall down",
    category: "actions",
    description: "V-fingers collapse upside-down onto palm."
  },
  {
    id: 394,
    gloss: "PUSH",
    english: "Push",
    category: "actions",
    description: "Both flat palms thrust forward with effort."
  },
  {
    id: 395,
    gloss: "PULL",
    english: "Pull",
    category: "actions",
    description: "Both fists reach out and haul backward towards chest."
  },
  {
    id: 396,
    gloss: "HOLD",
    english: "Hold",
    category: "actions",
    description: "Both fists grip firmly in static suspension."
  },
  {
    id: 397,
    gloss: "CARRY",
    english: "Carry",
    category: "actions",
    description: "Both cupped hands cradle load walking forward."
  },
  {
    id: 398,
    gloss: "DROP",
    english: "Drop",
    category: "actions",
    description: "Fists open abruptly releasing imaginary item downward."
  },
  {
    id: 399,
    gloss: "LIFT",
    english: "Lift",
    category: "actions",
    description: "Both flat palms facing up rise with heavy load."
  },
  {
    id: 400,
    gloss: "THROW",
    english: "Throw",
    category: "actions",
    description: "Fist swings from ear and releases open fingers forward."
  },
  {
    id: 401,
    gloss: "CATCH",
    english: "Catch",
    category: "actions",
    description: "Both open hands snatch item out of air into fists."
  },
  {
    id: 402,
    gloss: "REACH",
    english: "Reach",
    category: "actions",
    description: "Arm extends fully forward stretching fingertips."
  },
  {
    id: 403,
    gloss: "TOUCH",
    english: "Touch",
    category: "actions",
    description: "Middle finger taps target surface delicately."
  },
  {
    id: 404,
    gloss: "PRESS",
    english: "Press / Push button",
    category: "actions",
    description: "Thumb or index presses firmly into surface."
  },
  {
    id: 405,
    gloss: "CUT",
    english: "Cut with scissors",
    category: "actions",
    description: "V-fingers snip repeatedly across surface."
  },
  {
    id: 406,
    gloss: "TEAR",
    english: "Tear paper",
    category: "actions",
    description: "Both fists grip and pull opposite directions ripping."
  },
  {
    id: 407,
    gloss: "FOLD",
    english: "Fold",
    category: "actions",
    description: "Flat hand bends over horizontal palm neatly."
  },
  {
    id: 408,
    gloss: "WRAP",
    english: "Wrap",
    category: "actions",
    description: "Hands circle around central object enveloping it."
  },
  {
    id: 409,
    gloss: "TIE",
    english: "Tie knot",
    category: "actions",
    description: "Both curved fingers twist together tightening knot."
  },
  {
    id: 410,
    gloss: "UNTIE",
    english: "Untie",
    category: "actions",
    description: "Fingers pull knot apart loosening loops."
  },
  {
    id: 411,
    gloss: "SHAKE",
    english: "Shake",
    category: "actions",
    description: "Fists oscillate rapidly back and forth."
  },
  {
    id: 412,
    gloss: "TWIST",
    english: "Twist / Wring",
    category: "actions",
    description: "Hands rotate in opposite directions wringing."
  },
  {
    id: 413,
    gloss: "BEND",
    english: "Bend",
    category: "actions",
    description: "Straight index finger flexes at knuckle."
  },
  {
    id: 414,
    gloss: "STRETCH",
    english: "Stretch",
    category: "actions",
    description: "Both fists pull apart expanding rubber band."
  },
  {
    id: 415,
    gloss: "SWEEP",
    english: "Sweep floor",
    category: "actions",
    description: "Both hands push broom back and forth on floor."
  },
  {
    id: 416,
    gloss: "MOP",
    english: "Mop floor",
    category: "actions",
    description: "Two-handed gripping handle swinging across floor."
  },
  {
    id: 417,
    gloss: "DUST",
    english: "Dust surface",
    category: "actions",
    description: "Curved fingers flick surface dusting particles away."
  },
  {
    id: 418,
    gloss: "POUR",
    english: "Pour liquid",
    category: "actions",
    description: "Cupped C-hand tilts sideways pouring liquid."
  },
  {
    id: 419,
    gloss: "SPILL",
    english: "Spill",
    category: "actions",
    description: "Hand slips sideways dropping imaginary water with shock."
  },
  {
    id: 420,
    gloss: "FILL",
    english: "Fill up",
    category: "actions",
    description: "Liquid level rises up container to brim."
  },
  {
    id: 421,
    gloss: "EMPTY",
    english: "Empty out",
    category: "actions",
    description: "Container flips upside-down shaking out contents."
  },
  {
    id: 422,
    gloss: "MIX",
    english: "Mix together",
    category: "actions",
    description: "Both hands swirl in circular convergence."
  },
  {
    id: 423,
    gloss: "STIR",
    english: "Stir spoon",
    category: "actions",
    description: "Pinched fingers circle imaginary spoon in bowl."
  },
  {
    id: 424,
    gloss: "BOIL",
    english: "Boil water",
    category: "actions",
    description: "Fingers flutter upward under flat palm like bubbles."
  },
  {
    id: 425,
    gloss: "FRY",
    english: "Fry pan",
    category: "actions",
    description: "Spatula flips imaginary food sizzling in skillet."
  },
  {
    id: 426,
    gloss: "BAKE",
    english: "Bake in oven",
    category: "actions",
    description: "Flat hand slides tray horizontally into oven."
  },
  {
    id: 427,
    gloss: "FREEZE",
    english: "Freeze / Cold lock",
    category: "actions",
    description: "Fingers claw and lock rigidly in ice cold."
  },
  {
    id: 428,
    gloss: "MELT",
    english: "Melt",
    category: "actions",
    description: "Locked fingers droop and dissolve downward into liquid."
  },
  {
    id: 429,
    gloss: "BURN",
    english: "Burn",
    category: "actions",
    description: "Fingers flick upward like rising flame heat."
  },
  {
    id: 430,
    gloss: "BLOW",
    english: "Blow air",
    category: "actions",
    description: "Pursed lips blow air across open palm."
  },
  {
    id: 431,
    gloss: "LOCK",
    english: "Lock with key",
    category: "actions",
    description: "A-thumb twists clockwise into non-dominant palm."
  },
  {
    id: 432,
    gloss: "UNLOCK",
    english: "Unlock with key",
    category: "actions",
    description: "A-thumb twists counter-clockwise opening lock."
  },
  {
    id: 433,
    gloss: "FIX_REPAIR",
    english: "Fix / Repair",
    category: "actions",
    description: "Both flat O-hands tap together repeatedly fixing."
  },
  {
    id: 434,
    gloss: "BREAK",
    english: "Break / Snap",
    category: "actions",
    description: "Fists held together snap sharply downward breaking."
  },
  {
    id: 435,
    gloss: "DESTROY",
    english: "Destroy",
    category: "actions",
    description: "Claws tear across and crush into shattered heap."
  },
  {
    id: 436,
    gloss: "BUILD",
    english: "Build / Construct",
    category: "actions",
    description: "Flat hands alternate stacking brick upon brick."
  },
  {
    id: 437,
    gloss: "PAINT_ACTION",
    english: "Paint surface",
    category: "actions",
    description: "Flat hand brushes broad vertical strokes."
  },
  {
    id: 438,
    gloss: "DRAW",
    english: "Draw with pencil",
    category: "actions",
    description: "Pinky or index traces artistic lines on palm."
  },
  {
    id: 439,
    gloss: "MEASURE",
    english: "Measure length",
    category: "actions",
    description: "Both Y-thumbs touch then pull apart measuring."
  },
  {
    id: 440,
    gloss: "SEW",
    english: "Sew needle",
    category: "actions",
    description: "Pinched needle pierces palm pulling thread."
  },
  {
    id: 441,
    gloss: "KNIT",
    english: "Knit wool",
    category: "actions",
    description: "Index fingers click together rhythmically knitting."
  },
  {
    id: 442,
    gloss: "PLANT",
    english: "Plant seed",
    category: "actions",
    description: "Pinch seed and press into soil smoothing over."
  },
  {
    id: 443,
    gloss: "WATER_PLANT",
    english: "Water plants",
    category: "actions",
    description: "Thumb tilts watering can sprinkling droplets."
  },
  {
    id: 444,
    gloss: "DIG",
    english: "Dig earth",
    category: "actions",
    description: "Both hands shovel imaginary soil scooping."
  },
  {
    id: 445,
    gloss: "AGREE",
    english: "Agree",
    category: "actions",
    description: "Index touches forehead then drops in checkmark nod."
  },
  {
    id: 446,
    gloss: "DISAGREE",
    english: "Disagree",
    category: "actions",
    description: "Index touches forehead then both index fingers pull apart."
  },
  {
    id: 447,
    gloss: "PROMISE",
    english: "Promise",
    category: "actions",
    description: "Index touches lips then stamps flat onto palm firmly."
  },
  {
    id: 448,
    gloss: "REFUSE",
    english: "Refuse",
    category: "actions",
    description: "S-fist with thumb extended jerks backward over shoulder."
  },
  {
    id: 449,
    gloss: "ACCEPT",
    english: "Accept",
    category: "actions",
    description: "Both open hands sweep inward to chest forming fists."
  },
  {
    id: 450,
    gloss: "REJECT",
    english: "Reject",
    category: "actions",
    description: "Flat hand sweeps sideways brushing matter away."
  },
  {
    id: 451,
    gloss: "DECIDE",
    english: "Decide",
    category: "actions",
    description: "Index touches forehead then drops into two firm F-hands."
  },
  {
    id: 452,
    gloss: "CHOOSE_SELECT",
    english: "Choose / Select",
    category: "actions",
    description: "Index and thumb pluck choice out of lineup."
  },
  {
    id: 453,
    gloss: "PREFER",
    english: "Prefer",
    category: "actions",
    description: "Middle finger taps chest favoring one side."
  },
  {
    id: 454,
    gloss: "HOPE",
    english: "Hope",
    category: "actions",
    description: "Fingers bend at temples looking forward with longing."
  },
  {
    id: 455,
    gloss: "WISH",
    english: "Wish",
    category: "actions",
    description: "C-hand pulls down chest indicating deep yearning."
  },
  {
    id: 456,
    gloss: "BELIEVE",
    english: "Believe",
    category: "actions",
    description: "Index touches forehead then clutters into firm clasp."
  },
  {
    id: 457,
    gloss: "DOUBT",
    english: "Doubt",
    category: "actions",
    description: "V-fingers bend over nose with squinting skepticism."
  },
  {
    id: 458,
    gloss: "GUESS",
    english: "Guess",
    category: "actions",
    description: "C-hand snaps across forehead catching thought in fist."
  },
  {
    id: 459,
    gloss: "IMAGINE",
    english: "Imagine",
    category: "actions",
    description: "I-pinky spirals upward from temple in dream loop."
  },
  {
    id: 460,
    gloss: "NOTICE",
    english: "Notice",
    category: "actions",
    description: "Index touches under eye then points to object."
  },
  {
    id: 461,
    gloss: "RECOGNIZE",
    english: "Recognize",
    category: "actions",
    description: "Index taps cheek then drops in knowing acknowledgment."
  },
  {
    id: 462,
    gloss: "REMIND",
    english: "Remind",
    category: "actions",
    description: "Thumb taps shoulder reminding someone from behind."
  },
  {
    id: 463,
    gloss: "EXPLAIN",
    english: "Explain",
    category: "actions",
    description: "Both F-hands slide forward and backward alternating."
  },
  {
    id: 464,
    gloss: "DESCRIBE",
    english: "Describe",
    category: "actions",
    description: "Both D-hands or F-hands articulate details outward."
  },
  {
    id: 465,
    gloss: "DISCUSS",
    english: "Discuss",
    category: "actions",
    description: "Index finger taps repeatedly on flat non-dominant palm."
  },
  {
    id: 466,
    gloss: "ARGUE",
    english: "Argue",
    category: "actions",
    description: "Both index fingers point at each other jabbing heatedly."
  },
  {
    id: 467,
    gloss: "DEBATE",
    english: "Debate",
    category: "actions",
    description: "Both flat hands alternate balancing points on scale."
  },
  {
    id: 468,
    gloss: "SUGGEST",
    english: "Suggest",
    category: "actions",
    description: "Both open hands held palm up sweep forward offering."
  },
  {
    id: 469,
    gloss: "ADVISE",
    english: "Advise",
    category: "actions",
    description: "Dominant hand taps back of non-dominant hand throwing guidance."
  },
  {
    id: 470,
    gloss: "WARN",
    english: "Warn",
    category: "actions",
    description: "Index finger taps back of wrist with cautious alert expression."
  },
  {
    id: 471,
    gloss: "COMMAND",
    english: "Command / Order",
    category: "actions",
    description: "Index finger drops from mouth pointing forward authoritatively."
  },
  {
    id: 472,
    gloss: "PERMIT_ALLOW",
    english: "Permit / Allow",
    category: "actions",
    description: "Both flat hands held low arc smoothly upward."
  },
  {
    id: 473,
    gloss: "FORBID_PROHIBIT",
    english: "Forbid / Prohibit",
    category: "actions",
    description: "L-hand chops sharply against flat vertical palm."
  },
  {
    id: 474,
    gloss: "ENCOURAGE",
    english: "Encourage",
    category: "actions",
    description: "Both open hands push forward rhythmically cheering on."
  },
  {
    id: 475,
    gloss: "PRAISE",
    english: "Praise / Applaud",
    category: "actions",
    description: "Clapping hands above chest with appreciative smile."
  },
  {
    id: 476,
    gloss: "CRITICIZE",
    english: "Criticize",
    category: "actions",
    description: "Index finger scratches an X across flat palm."
  },
  {
    id: 477,
    gloss: "COMPLAIN",
    english: "Complain",
    category: "actions",
    description: "Clawed hand strikes chest with dissatisfied frown."
  },
  {
    id: 478,
    gloss: "BLAME",
    english: "Blame",
    category: "actions",
    description: "A-thumb points accusatorily towards target person."
  },
  {
    id: 479,
    gloss: "FORGIVE",
    english: "Forgive",
    category: "actions",
    description: "Fingertips brush flat palm outward wiping clean."
  },
  {
    id: 480,
    gloss: "APOLOGIZE",
    english: "Apologize",
    category: "actions",
    description: "Fist circles over heart with contrite bowed head."
  },
  {
    id: 481,
    gloss: "INVITE",
    english: "Invite",
    category: "actions",
    description: "Curved hand held palm up sweeps inward welcomingly."
  },
  {
    id: 482,
    gloss: "CELEBRATE",
    english: "Celebrate",
    category: "actions",
    description: "Both fists with thumbs out swing overhead in party joy."
  },
  {
    id: 483,
    gloss: "SUPPORT",
    english: "Support",
    category: "actions",
    description: "Dominant fist props up non-dominant elbow firmly."
  },
  {
    id: 484,
    gloss: "PROTECT",
    english: "Protect",
    category: "actions",
    description: "Both crossed wrists shield body defensively."
  },
  {
    id: 485,
    gloss: "DEFEND",
    english: "Defend",
    category: "actions",
    description: "Fists held high in guarding boxing stance."
  },
  {
    id: 486,
    gloss: "ATTACK",
    english: "Attack",
    category: "actions",
    description: "Both clawed hands lunge forward aggressively."
  },
  {
    id: 487,
    gloss: "ESCAPE",
    english: "Escape",
    category: "actions",
    description: "Index finger slips quickly between non-dominant fingers running."
  },
  {
    id: 488,
    gloss: "AVOID",
    english: "Avoid",
    category: "actions",
    description: "Both hands dodge sideways steering clear of target."
  },
  {
    id: 489,
    gloss: "SEARCH_LOOK_FOR",
    english: "Search / Look for",
    category: "actions",
    description: "C-hand circles in front of eyes scanning area."
  },
  {
    id: 490,
    gloss: "FIND",
    english: "Find / Discover",
    category: "actions",
    description: "F-hand plucks imaginary treasure out of air triumphantly."
  },
  {
    id: 491,
    gloss: "LOSE",
    english: "Lose item",
    category: "actions",
    description: "Both fingertips touching drop downward slipping apart."
  },
  {
    id: 492,
    gloss: "HIDE",
    english: "Hide",
    category: "actions",
    description: "Dominant fist ducks underneath curved non-dominant hand."
  },
  {
    id: 493,
    gloss: "REVEAL_SHOW",
    english: "Reveal / Show",
    category: "actions",
    description: "Index rests on palm and thrusts forward revealing."
  },
  {
    id: 494,
    gloss: "PROVE",
    english: "Prove",
    category: "actions",
    description: "Dominant flat hand slaps down onto non-dominant palm."
  },
  {
    id: 495,
    gloss: "TEST_ACTION",
    english: "Test / Verify",
    category: "actions",
    description: "Index draws question mark in air then checkmark."
  },
  {
    id: 496,
    gloss: "PRACTICE",
    english: "Practice",
    category: "actions",
    description: "A-fist rubs back and forth against horizontal index finger."
  },
  {
    id: 497,
    gloss: "IMPROVE",
    english: "Improve",
    category: "actions",
    description: "Hand steps upward along forearm reaching higher tier."
  },
  {
    id: 498,
    gloss: "SUCCEED",
    english: "Succeed / Win",
    category: "actions",
    description: "Both index fingers twirl upward into victory celebration."
  },
  {
    id: 499,
    gloss: "FAIL_ACTION",
    english: "Fail",
    category: "actions",
    description: "V-fingers slide off palm and tumble downward."
  },
  {
    id: 500,
    gloss: "TRY_ATTEMPT",
    english: "Try / Attempt",
    category: "actions",
    description: "Both T-hands thrust forward with determined effort."
  },
  {
    id: 501,
    gloss: "CONTINUE",
    english: "Continue",
    category: "actions",
    description: "Both thumbs touch and glide forward smoothly."
  },
  {
    id: 502,
    gloss: "PAUSE_ACTION",
    english: "Pause",
    category: "actions",
    description: "Index fingers hook into parallel pause bars."
  },
  {
    id: 503,
    gloss: "RESUME",
    english: "Resume",
    category: "actions",
    description: "Hands release pause bars and spring back into motion."
  },
  {
    id: 504,
    gloss: "POSTPONE",
    english: "Postpone",
    category: "actions",
    description: "Both F-hands lift and push forward to future date."
  },
  {
    id: 505,
    gloss: "SPEED_UP",
    english: "Speed up",
    category: "actions",
    description: "Both index fingers snap back accelerating fast."
  },
  {
    id: 506,
    gloss: "SLOW_DOWN",
    english: "Slow down",
    category: "actions",
    description: "Flat hand pats downward easing tempo."
  },
  {
    id: 507,
    gloss: "ARRANGE",
    english: "Arrange",
    category: "actions",
    description: "Both flat hands shift items into neat orderly rows."
  },
  {
    id: 508,
    gloss: "ORGANIZE",
    english: "Organize",
    category: "actions",
    description: "Curved hands gather scattered items into structured pile."
  },
  {
    id: 509,
    gloss: "MANAGE_ACTION",
    english: "Manage",
    category: "actions",
    description: "Both X-hands alternate tugging reins like guiding horse."
  },
  {
    id: 510,
    gloss: "LEAD",
    english: "Lead",
    category: "actions",
    description: "Dominant hand grasps non-dominant fingertips leading forward."
  },
  {
    id: 511,
    gloss: "FOLLOW",
    english: "Follow",
    category: "actions",
    description: "Non-dominant fist leads as dominant fist tracks closely behind."
  },
  {
    id: 512,
    gloss: "COOPERATE",
    english: "Cooperate",
    category: "actions",
    description: "Both hooked index fingers circle together harmoniously."
  },
  {
    id: 513,
    gloss: "SHARE",
    english: "Share",
    category: "actions",
    description: "Flat hand cuts back and forth dividing equally between two."
  },
  {
    id: 514,
    gloss: "DISTRIBUTE",
    english: "Distribute",
    category: "actions",
    description: "Both hands hand out portions in sweeping arc."
  },
  {
    id: 515,
    gloss: "BORROW",
    english: "Borrow",
    category: "actions",
    description: "Both crossed V-hands pull towards chest receiving loan."
  },
  {
    id: 516,
    gloss: "LEND",
    english: "Lend",
    category: "actions",
    description: "Both crossed V-hands push outward away from chest."
  },
  {
    id: 517,
    gloss: "SAVE_MONEY",
    english: "Save money",
    category: "actions",
    description: "Money sign tucked securely into non-dominant palm pocket."
  },
  {
    id: 518,
    gloss: "SPEND",
    english: "Spend money",
    category: "actions",
    description: "Money peeled off palm and handed away freely."
  },
  {
    id: 519,
    gloss: "WASTE",
    english: "Waste",
    category: "actions",
    description: "Both open hands throw contents away with regretful expression."
  },
  {
    id: 520,
    gloss: "INVEST",
    english: "Invest",
    category: "actions",
    description: "Coins planted into non-dominant palm growing upward."
  },
  {
    id: 521,
    gloss: "EARN",
    english: "Earn",
    category: "actions",
    description: "Curved hand scoops wealth onto flat non-dominant palm."
  },
  {
    id: 522,
    gloss: "DONATE",
    english: "Donate",
    category: "actions",
    description: "Both hands extend gift forward generously without expecting return."
  },
  {
    id: 523,
    gloss: "COMPETE",
    english: "Compete",
    category: "actions",
    description: "Both fists face each other jockeying forward alternately."
  },
  {
    id: 524,
    gloss: "PLAY_GAME",
    english: "Play game",
    category: "actions",
    description: "Both Y-hands shake playfully near waist."
  },
  {
    id: 525,
    gloss: "EXERCISE",
    english: "Exercise / Workout",
    category: "actions",
    description: "Both fists lift weights up to shoulders pumping."
  },
  {
    id: 526,
    gloss: "DANCE",
    english: "Dance",
    category: "actions",
    description: "Inverted V-fingers swing back and forth across flat palm."
  },
  {
    id: 527,
    gloss: "SING_ACTION",
    english: "Sing",
    category: "actions",
    description: "Curved hand sweeps melodically from throat outward."
  },
  {
    id: 528,
    gloss: "PRAY",
    english: "Pray",
    category: "actions",
    description: "Both flat palms pressed together facing upward reverently."
  },
  {
    id: 529,
    gloss: "MEDITATE",
    english: "Meditate",
    category: "actions",
    description: "Both hands in Gyan mudra on knees with serene breath."
  },
  {
    id: 530,
    gloss: "BREATHE",
    english: "Breathe",
    category: "actions",
    description: "Both hands expand and contract on chest in rhythm."
  },
  {
    id: 531,
    gloss: "SNEEZE",
    english: "Sneeze",
    category: "actions",
    description: "Index touches nose then jerks forward with explosive sneeze."
  },
  {
    id: 532,
    gloss: "YAWN",
    english: "Yawn",
    category: "actions",
    description: "Hand covers open gaping mouth with sleepy eyes."
  },
  {
    id: 533,
    gloss: "SMILE_ACTION",
    english: "Smile",
    category: "actions",
    description: "Index fingers draw happy curve from mouth corners up cheek."
  },
  {
    id: 534,
    gloss: "LAUGH",
    english: "Laugh",
    category: "actions",
    description: "Both hands flutter at ribs with joyful vibrating chuckles."
  },
  {
    id: 535,
    gloss: "CRY_WEEP",
    english: "Cry / Weep",
    category: "actions",
    description: "Index fingers trace downward tears along cheeks repeatedly."
  },
  {
    id: 536,
    gloss: "SHOUT",
    english: "Shout / Yell",
    category: "actions",
    description: "Both cupped hands megaphone mouth projecting loud voice."
  },
  {
    id: 537,
    gloss: "WHISPER",
    english: "Whisper",
    category: "actions",
    description: "Hand cups side of mouth leaning close softly."
  },
  {
    id: 538,
    gloss: "NOD_ACTION",
    english: "Nod",
    category: "actions",
    description: "S-fist nods up and down affirming agreement."
  },
  {
    id: 539,
    gloss: "WAVE_HAND",
    english: "Wave hand",
    category: "actions",
    description: "Open palm flutters gently greeting or attracting attention."
  },
  {
    id: 540,
    gloss: "TRAIN_STATION",
    english: "Train station",
    category: "transit",
    description: "Train sign followed by designated station boundary."
  },
  {
    id: 541,
    gloss: "BUS_STOP",
    english: "Bus stop",
    category: "transit",
    description: "Bus sign followed by pole sign and waiting gesture."
  },
  {
    id: 542,
    gloss: "AIRPORT",
    english: "Airport",
    category: "transit",
    description: "Airplane handshape landing on flat runway palm."
  },
  {
    id: 543,
    gloss: "HARBOR_PORT",
    english: "Harbor / Seaport",
    category: "transit",
    description: "Ship boat sign docking against concrete wharf."
  },
  {
    id: 544,
    gloss: "SHIP_BOAT",
    english: "Ship / Boat",
    category: "transit",
    description: "Both cupped palms joined at pinkies gliding through water."
  },
  {
    id: 545,
    gloss: "HELICOPTER",
    english: "Helicopter",
    category: "transit",
    description: "Three fingers spin horizontally above thumb mast."
  },
  {
    id: 546,
    gloss: "SUBWAY",
    english: "Subway / Metro",
    category: "transit",
    description: "Train handshape glides beneath horizontal flat palm."
  },
  {
    id: 547,
    gloss: "TRAM",
    english: "Tram",
    category: "transit",
    description: "Train sign with two fingers touching overhead electric wire."
  },
  {
    id: 548,
    gloss: "VAN",
    english: "Van",
    category: "transit",
    description: "Boxy vehicle shape outlined with steering motion."
  },
  {
    id: 549,
    gloss: "TRUCK",
    english: "Truck / Lorry",
    category: "transit",
    description: "Large steering wheel with massive horn honk gesture."
  },
  {
    id: 550,
    gloss: "AMBULANCE_VEHICLE",
    english: "Ambulance vehicle",
    category: "transit",
    description: "Ambulance siren flashing atop speeding vehicle."
  },
  {
    id: 551,
    gloss: "FIRE_TRUCK",
    english: "Fire truck",
    category: "transit",
    description: "Hose spraying water followed by red truck sign."
  },
  {
    id: 552,
    gloss: "POLICE_CAR",
    english: "Police car",
    category: "transit",
    description: "Police badge tap followed by flashing roof beacon."
  },
  {
    id: 553,
    gloss: "TRAFFIC",
    english: "Traffic congestion",
    category: "transit",
    description: "Both open claw hands collide and gridlock together."
  },
  {
    id: 554,
    gloss: "TRAFFIC_LIGHT",
    english: "Traffic light",
    category: "transit",
    description: "Vertical column flashing green, yellow, red lights."
  },
  {
    id: 555,
    gloss: "CROSSING",
    english: "Railway crossing",
    category: "transit",
    description: "Both arms drop horizontally like railway safety gates."
  },
  {
    id: 556,
    gloss: "BRIDGE",
    english: "Bridge",
    category: "transit",
    description: "Both arched hands span across wide river below."
  },
  {
    id: 557,
    gloss: "FLYOVER",
    english: "Flyover / Overpass",
    category: "transit",
    description: "Road sign rising on elevated pillars over traffic."
  },
  {
    id: 558,
    gloss: "TUNNEL",
    english: "Tunnel",
    category: "transit",
    description: "Hand darts through enclosed curved archway."
  },
  {
    id: 559,
    gloss: "ROUNDABOUT",
    english: "Roundabout / Traffic circle",
    category: "transit",
    description: "Index finger loops circular traffic island."
  },
  {
    id: 560,
    gloss: "ZEBRA_CROSSING",
    english: "Zebra pedestrian crossing",
    category: "transit",
    description: "Flat hands trace horizontal walking stripes."
  },
  {
    id: 561,
    gloss: "INTERSECTION",
    english: "Intersection / Crossroads",
    category: "transit",
    description: "Both index fingers cross at right angles."
  },
  {
    id: 562,
    gloss: "CORNER",
    english: "Street corner",
    category: "transit",
    description: "Both flat hands meet at 90 degree angle."
  },
  {
    id: 563,
    gloss: "SIDEWALK_FOOTPATH",
    english: "Sidewalk / Footpath",
    category: "transit",
    description: "Narrow paved walkway beside road."
  },
  {
    id: 564,
    gloss: "HIGHWAY_EXPRESSWAY",
    english: "Highway / Expressway",
    category: "transit",
    description: "Wide open parallel roads with fast express lanes."
  },
  {
    id: 565,
    gloss: "TOLL_GATE",
    english: "Toll plaza / Toll gate",
    category: "transit",
    description: "Vehicle stops, hands coin through booth barrier."
  },
  {
    id: 566,
    gloss: "PARKING",
    english: "Parking lot",
    category: "transit",
    description: "P-hand stamps onto open flat palm bay."
  },
  {
    id: 567,
    gloss: "GARAGE",
    english: "Garage",
    category: "transit",
    description: "Car drives under sheltered roof structure."
  },
  {
    id: 568,
    gloss: "PETROL_PUMP",
    english: "Petrol pump / Fuel station",
    category: "transit",
    description: "Nozzle inserts into vehicle tank fueling."
  },
  {
    id: 569,
    gloss: "ELECTRIC_CHARGING",
    english: "Electric charging station",
    category: "transit",
    description: "Plug connector docks into car battery socket."
  },
  {
    id: 570,
    gloss: "BREAKDOWN",
    english: "Vehicle breakdown",
    category: "transit",
    description: "Engine smoke rising with stalled steering wheel."
  },
  {
    id: 571,
    gloss: "PUNCTURE",
    english: "Tire puncture",
    category: "transit",
    description: "Round wheel deflating flat with hissing air."
  },
  {
    id: 572,
    gloss: "ACCIDENT_SCENE",
    english: "Accident scene",
    category: "transit",
    description: "Two vehicles colliding with police warning cone."
  },
  {
    id: 573,
    gloss: "SPEED_LIMIT",
    english: "Speed limit",
    category: "transit",
    description: "Speed sign with numeral boundary restriction."
  },
  {
    id: 574,
    gloss: "HELMET",
    english: "Helmet",
    category: "transit",
    description: "Both curved hands strap safety helmet under chin."
  },
  {
    id: 575,
    gloss: "SEATBELT",
    english: "Seatbelt",
    category: "transit",
    description: "Hand pulls diagonal strap clicking into latch."
  },
  {
    id: 576,
    gloss: "AIR_CONDITIONING",
    english: "Air Conditioning / AC",
    category: "transit",
    description: "Letters A-C followed by cool air blowing on face."
  },
  {
    id: 577,
    gloss: "NON_AC",
    english: "Non-AC",
    category: "transit",
    description: "No AC with fanning sweat off forehead."
  },
  {
    id: 578,
    gloss: "SLEEPER_CLASS",
    english: "Sleeper class berth",
    category: "transit",
    description: "Train sign followed by horizontal sleeping bunk."
  },
  {
    id: 579,
    gloss: "GENERAL_CLASS",
    english: "General unreserved coach",
    category: "transit",
    description: "Crowded people jostling into open compartment."
  },
  {
    id: 580,
    gloss: "LADIES_COACH",
    english: "Ladies coach",
    category: "transit",
    description: "Female sign followed by train carriage boundary."
  },
  {
    id: 581,
    gloss: "RESERVED_SEAT",
    english: "Reserved seat",
    category: "transit",
    description: "Confirmed ticket pinned onto seat headrest."
  },
  {
    id: 582,
    gloss: "UNRESERVED",
    english: "Unreserved",
    category: "transit",
    description: "Open seating without name reservation slip."
  },
  {
    id: 583,
    gloss: "TICKET_COUNTER",
    english: "Ticket counter",
    category: "transit",
    description: "Glass window partition with cash exchanged for pass."
  },
  {
    id: 584,
    gloss: "TICKET_CHECKER_TTE",
    english: "Ticket Examiner / TTE",
    category: "transit",
    description: "Inspector uniform badge checking passenger chart."
  },
  {
    id: 585,
    gloss: "WAITING_ROOM",
    english: "Waiting room",
    category: "transit",
    description: "Clock tapping followed by comfortable chairs inside."
  },
  {
    id: 586,
    gloss: "CLOAK_ROOM",
    english: "Cloak room / Luggage locker",
    category: "transit",
    description: "Baggage handed over counter receiving brass token."
  },
  {
    id: 587,
    gloss: "OVERBRIDGE",
    english: "Foot overbridge",
    category: "transit",
    description: "Stairs climbing up, crossing above tracks, descending."
  },
  {
    id: 588,
    gloss: "ESCALATOR",
    english: "Escalator",
    category: "transit",
    description: "Inverted V-legs stand motionless gliding diagonally up."
  },
  {
    id: 589,
    gloss: "LIFT_ELEVATOR",
    english: "Elevator / Lift",
    category: "transit",
    description: "Closed doors open as vertical carriage ascends."
  },
  {
    id: 590,
    gloss: "STAIRS",
    english: "Stairs",
    category: "transit",
    description: "V-fingers climb step by step up angled incline."
  },
  {
    id: 591,
    gloss: "BOARDING_PASS",
    english: "Boarding pass",
    category: "transit",
    description: "Flight ticket stamped with flight gate number."
  },
  {
    id: 592,
    gloss: "SECURITY_CHECK",
    english: "Security checkpoint",
    category: "transit",
    description: "Metal detector wand scanning arms and torso."
  },
  {
    id: 593,
    gloss: "LUGGAGE_CHECK",
    english: "Luggage scanner",
    category: "transit",
    description: "Suitcase gliding through X-ray tunnel conveyor."
  },
  {
    id: 594,
    gloss: "PASSPORT",
    english: "Passport",
    category: "transit",
    description: "Small official booklet stamped at immigration border."
  },
  {
    id: 595,
    gloss: "VISA",
    english: "Visa stamp",
    category: "transit",
    description: "Passport page receiving authorized entry stamp."
  },
  {
    id: 596,
    gloss: "ID_PROOF",
    english: "Identity proof",
    category: "transit",
    description: "Card displaying photo and authorized government stamp."
  },
  {
    id: 597,
    gloss: "AADHAAR_CARD",
    english: "Aadhaar card",
    category: "transit",
    description: "Thumbprint biometric impression on official card."
  },
  {
    id: 598,
    gloss: "PAN_CARD",
    english: "PAN card",
    category: "transit",
    description: "Tax card verifying permanent account number."
  },
  {
    id: 599,
    gloss: "DRIVING_LICENSE",
    english: "Driving license",
    category: "transit",
    description: "Steering wheel turning followed by official ID card."
  },
  {
    id: 600,
    gloss: "MILEAGE",
    english: "Distance / Mileage",
    category: "transit",
    description: "Odometer numbers rolling over on vehicle dashboard."
  },
  {
    id: 601,
    gloss: "JOURNEY",
    english: "Journey / Expedition",
    category: "transit",
    description: "Wavy travel path leading to distant horizons."
  },
  {
    id: 602,
    gloss: "HEAD",
    english: "Head",
    category: "healthcare",
    description: "Both palms tap sides of cranium gently."
  },
  {
    id: 603,
    gloss: "BRAIN",
    english: "Brain",
    category: "healthcare",
    description: "Fingers tap temple indicating thought center."
  },
  {
    id: 604,
    gloss: "EYE",
    english: "Eye",
    category: "healthcare",
    description: "Index finger points directly beside eyeball."
  },
  {
    id: 605,
    gloss: "EAR",
    english: "Ear",
    category: "healthcare",
    description: "Thumb and index grasp earlobe."
  },
  {
    id: 606,
    gloss: "NOSE",
    english: "Nose",
    category: "healthcare",
    description: "Index finger touches tip of nose."
  },
  {
    id: 607,
    gloss: "MOUTH",
    english: "Mouth",
    category: "healthcare",
    description: "Index finger outlines lips circle."
  },
  {
    id: 608,
    gloss: "TONGUE",
    english: "Tongue",
    category: "healthcare",
    description: "Tongue touches lip with index pointing."
  },
  {
    id: 609,
    gloss: "TEETH",
    english: "Teeth",
    category: "healthcare",
    description: "Index finger taps front teeth."
  },
  {
    id: 610,
    gloss: "LIPS",
    english: "Lips",
    category: "healthcare",
    description: "Index finger traces lipstick line."
  },
  {
    id: 611,
    gloss: "THROAT",
    english: "Throat",
    category: "healthcare",
    description: "Thumb and fingers span neck throat."
  },
  {
    id: 612,
    gloss: "NECK",
    english: "Neck",
    category: "healthcare",
    description: "Flat hand pats side of neck."
  },
  {
    id: 613,
    gloss: "SHOULDER",
    english: "Shoulder",
    category: "healthcare",
    description: "Fingers tap opposite shoulder."
  },
  {
    id: 614,
    gloss: "CHEST_ANATOMY",
    english: "Chest",
    category: "healthcare",
    description: "Both palms rest on ribcage."
  },
  {
    id: 615,
    gloss: "HEART_ORGAN",
    english: "Heart",
    category: "healthcare",
    description: "Fist beats rhythmically over left chest."
  },
  {
    id: 616,
    gloss: "LUNGS",
    english: "Lungs",
    category: "healthcare",
    description: "Both hands outline twin lung lobes breathing."
  },
  {
    id: 617,
    gloss: "STOMACH_ORGAN",
    english: "Stomach",
    category: "healthcare",
    description: "Flat palm circles abdominal region."
  },
  {
    id: 618,
    gloss: "LIVER",
    english: "Liver",
    category: "healthcare",
    description: "Hand pats upper right abdominal quadrant."
  },
  {
    id: 619,
    gloss: "KIDNEY",
    english: "Kidneys",
    category: "healthcare",
    description: "Both hands tap lower back flanking spine."
  },
  {
    id: 620,
    gloss: "BACK_SPINE",
    english: "Back / Spine",
    category: "healthcare",
    description: "Hand reaches around tapping spinal vertebrae."
  },
  {
    id: 621,
    gloss: "WAIST",
    english: "Waist",
    category: "healthcare",
    description: "Both hands grip waistband."
  },
  {
    id: 622,
    gloss: "ARM",
    english: "Arm",
    category: "healthcare",
    description: "Hand caresses opposite forearm."
  },
  {
    id: 623,
    gloss: "ELBOW",
    english: "Elbow",
    category: "healthcare",
    description: "Hand cups opposite elbow joint."
  },
  {
    id: 624,
    gloss: "WRIST",
    english: "Wrist",
    category: "healthcare",
    description: "Fingers encircle opposite wrist."
  },
  {
    id: 625,
    gloss: "HAND_ANATOMY",
    english: "Hand",
    category: "healthcare",
    description: "Open 5-hand presented clearly."
  },
  {
    id: 626,
    gloss: "FINGERS",
    english: "Fingers",
    category: "healthcare",
    description: "All five fingers flutter in display."
  },
  {
    id: 627,
    gloss: "LEG",
    english: "Leg",
    category: "healthcare",
    description: "Hand pats thigh and shin."
  },
  {
    id: 628,
    gloss: "KNEE",
    english: "Knee",
    category: "healthcare",
    description: "Hand cups patella knee cap."
  },
  {
    id: 629,
    gloss: "ANKLE",
    english: "Ankle",
    category: "healthcare",
    description: "Hand points to ankle joint above foot."
  },
  {
    id: 630,
    gloss: "FOOT",
    english: "Foot",
    category: "healthcare",
    description: "Hand points down to sole of foot."
  },
  {
    id: 631,
    gloss: "TOES",
    english: "Toes",
    category: "healthcare",
    description: "Fingers wiggle pointing to foot digits."
  },
  {
    id: 632,
    gloss: "BONE",
    english: "Bone",
    category: "healthcare",
    description: "Bent knuckles tap together producing hard sound."
  },
  {
    id: 633,
    gloss: "MUSCLE",
    english: "Muscle",
    category: "healthcare",
    description: "Bicep flexes with opposite hand squeezing muscle."
  },
  {
    id: 634,
    gloss: "SKIN",
    english: "Skin",
    category: "healthcare",
    description: "Fingers pinch small fold of skin on arm."
  },
  {
    id: 635,
    gloss: "VEIN",
    english: "Vein",
    category: "healthcare",
    description: "Index finger traces blue line down inner forearm."
  },
  {
    id: 636,
    gloss: "PULSE",
    english: "Pulse",
    category: "healthcare",
    description: "Two fingers press radial artery feeling heart rhythm."
  },
  {
    id: 637,
    gloss: "ICU",
    english: "Intensive Care Unit (ICU)",
    category: "healthcare",
    description: "Letters I-C-U with vital signs heart monitor."
  },
  {
    id: 638,
    gloss: "WARD",
    english: "Hospital ward",
    category: "healthcare",
    description: "Room of patient recovery beds."
  },
  {
    id: 639,
    gloss: "OPERATION_THEATRE",
    english: "Operation Theatre (OT)",
    category: "healthcare",
    description: "Surgical gown with intense surgical lamp focus."
  },
  {
    id: 640,
    gloss: "SURGEON",
    english: "Surgeon",
    category: "healthcare",
    description: "Sterile scalpel incision gesture, then doctor sign."
  },
  {
    id: 641,
    gloss: "DENTIST",
    english: "Dentist",
    category: "healthcare",
    description: "Tapping teeth with dental probe, then doctor sign."
  },
  {
    id: 642,
    gloss: "EYE_SPECIALIST",
    english: "Eye specialist / Ophthalmologist",
    category: "healthcare",
    description: "Pointing to eye examining pupil, then doctor sign."
  },
  {
    id: 643,
    gloss: "CARDIOLOGIST",
    english: "Cardiologist",
    category: "healthcare",
    description: "Listening to heartbeat with stethoscope, then doctor."
  },
  {
    id: 644,
    gloss: "PEDIATRICIAN",
    english: "Pediatrician",
    category: "healthcare",
    description: "Child baby sign followed by gentle doctor care."
  },
  {
    id: 645,
    gloss: "PHYSIOTHERAPY",
    english: "Physiotherapy",
    category: "healthcare",
    description: "Assisted joint flexing and rehabilitation stretch."
  },
  {
    id: 646,
    gloss: "THERAPY",
    english: "Therapy",
    category: "healthcare",
    description: "T-hand lifts upward from flat base encouraging healing."
  },
  {
    id: 647,
    gloss: "COUNSELING",
    english: "Counseling",
    category: "healthcare",
    description: "Open discussion guidance sharing mental clarity."
  },
  {
    id: 648,
    gloss: "MENTAL_HEALTH",
    english: "Mental Health",
    category: "healthcare",
    description: "Brain sign followed by wellness health vitality."
  },
  {
    id: 649,
    gloss: "DEPRESSION",
    english: "Depression",
    category: "healthcare",
    description: "Both hands descend down chest with heavy sorrowful slump."
  },
  {
    id: 650,
    gloss: "ANXIETY",
    english: "Anxiety",
    category: "healthcare",
    description: "Hands tremor nervously over chest with racing pulse."
  },
  {
    id: 651,
    gloss: "STRESS",
    english: "Stress",
    category: "healthcare",
    description: "Downward fist pressing heavily on flat hand under strain."
  },
  {
    id: 652,
    gloss: "ASTHMA",
    english: "Asthma",
    category: "healthcare",
    description: "Chest tightens gasping for breath reaching for inhaler."
  },
  {
    id: 653,
    gloss: "DIABETES",
    english: "Diabetes",
    category: "healthcare",
    description: "Sugar sign followed by fingerprick glucose test."
  },
  {
    id: 654,
    gloss: "BLOOD_PRESSURE",
    english: "Blood pressure",
    category: "healthcare",
    description: "Inflatable cuff wraps around arm pumping bulb."
  },
  {
    id: 655,
    gloss: "HYPERTENSION",
    english: "Hypertension",
    category: "healthcare",
    description: "High pressure gauge soaring into danger zone."
  },
  {
    id: 656,
    gloss: "HEART_ATTACK",
    english: "Heart attack",
    category: "healthcare",
    description: "Hand clutches chest violently with sudden agony."
  },
  {
    id: 657,
    gloss: "STROKE",
    english: "Stroke",
    category: "healthcare",
    description: "Side of face droops with sudden arm weakness."
  },
  {
    id: 658,
    gloss: "PARALYSIS",
    english: "Paralysis",
    category: "healthcare",
    description: "Limb falls motionless unable to respond."
  },
  {
    id: 659,
    gloss: "CANCER",
    english: "Cancer",
    category: "healthcare",
    description: "C-claw consumes cell followed by medical therapy."
  },
  {
    id: 660,
    gloss: "TUMOR",
    english: "Tumor / Lump",
    category: "healthcare",
    description: "Curved fingers outline abnormal swollen mass."
  },
  {
    id: 661,
    gloss: "INFECTION",
    english: "Infection",
    category: "healthcare",
    description: "Shaking I-hand spreads across swollen redness."
  },
  {
    id: 662,
    gloss: "VIRUS",
    english: "Virus",
    category: "healthcare",
    description: "Spiky microscopic germ sphere invading cells."
  },
  {
    id: 663,
    gloss: "BACTERIA",
    english: "Bacteria",
    category: "healthcare",
    description: "Tiny organism multiplying under microscope lens."
  },
  {
    id: 664,
    gloss: "FUNGUS",
    english: "Fungus",
    category: "healthcare",
    description: "Spreading ring patch on surface of skin."
  },
  {
    id: 665,
    gloss: "VACCINATION_DOSE",
    english: "Vaccine dose",
    category: "healthcare",
    description: "Syringe needle delivering protective immunizing dose."
  },
  {
    id: 666,
    gloss: "DOSAGE",
    english: "Medicine dosage",
    category: "healthcare",
    description: "Exact measurement of spoons or tablets on schedule."
  },
  {
    id: 667,
    gloss: "SYRUP",
    english: "Cough syrup",
    category: "healthcare",
    description: "Liquid poured from medicine bottle onto spoon and swallowed."
  },
  {
    id: 668,
    gloss: "DROPS",
    english: "Eye/Ear drops",
    category: "healthcare",
    description: "Squeezing tiny liquid droplet into open eye or ear."
  },
  {
    id: 669,
    gloss: "OINTMENT",
    english: "Ointment / Balme",
    category: "healthcare",
    description: "Soothing medicinal paste smoothed over wound."
  },
  {
    id: 670,
    gloss: "CREAM",
    english: "Medicated cream",
    category: "healthcare",
    description: "Fingers rub healing cream gently into skin."
  },
  {
    id: 671,
    gloss: "INHALER",
    english: "Inhaler puff",
    category: "healthcare",
    description: "Canister pressed into mouth inhaling deep aerosol puff."
  },
  {
    id: 672,
    gloss: "STRETCHER",
    english: "Stretcher",
    category: "healthcare",
    description: "Horizontal canvas cot carried by two paramedics."
  },
  {
    id: 673,
    gloss: "CRUTCHES",
    english: "Crutches",
    category: "healthcare",
    description: "Both hands grip under arm supports hobbling forward."
  },
  {
    id: 674,
    gloss: "WALKING_STICK",
    english: "Walking stick / Cane",
    category: "healthcare",
    description: "Hand grips curved handle leaning weight forward."
  },
  {
    id: 675,
    gloss: "FIRST_AID",
    english: "First aid",
    category: "healthcare",
    description: "Red cross sign followed by emergency bandage care."
  },
  {
    id: 676,
    gloss: "FIRST_AID_KIT",
    english: "First aid kit",
    category: "healthcare",
    description: "Box marked with medical cross containing supplies."
  },
  {
    id: 677,
    gloss: "COTTON",
    english: "Cotton gauze",
    category: "healthcare",
    description: "Soft fluffy cotton pad dabbing sterile antiseptic."
  },
  {
    id: 678,
    gloss: "THERMOMETER",
    english: "Thermometer",
    category: "healthcare",
    description: "Slender tube placed under tongue reading fever scale."
  },
  {
    id: 679,
    gloss: "STETHOSCOPE",
    english: "Stethoscope",
    category: "healthcare",
    description: "Earpieces placed into ears with chest diaphragm listening."
  },
  {
    id: 680,
    gloss: "BLOOD_TEST",
    english: "Blood test",
    category: "healthcare",
    description: "Vein tapped with vial drawing blood sample for lab."
  },
  {
    id: 681,
    gloss: "WHEAT",
    english: "Wheat",
    category: "shopping_food",
    description: "Grain stalk waving in wind, ground into flour."
  },
  {
    id: 682,
    gloss: "FLOUR_ATTA",
    english: "Flour / Atta",
    category: "shopping_food",
    description: "Powder rubbed between fingers and kneaded in bowl."
  },
  {
    id: 683,
    gloss: "DAL_LENTILS",
    english: "Dal / Lentils",
    category: "shopping_food",
    description: "Yellow grains poured and simmered into fragrant soup."
  },
  {
    id: 684,
    gloss: "CHICKPEAS",
    english: "Chickpeas / Chana",
    category: "shopping_food",
    description: "Round hard peas soaked and cooked in masala."
  },
  {
    id: 685,
    gloss: "BEANS",
    english: "Beans / Rajma",
    category: "shopping_food",
    description: "Kidney-shaped beans simmered into thick gravy."
  },
  {
    id: 686,
    gloss: "POTATO",
    english: "Potato / Aloo",
    category: "shopping_food",
    description: "Peeling brown skin off tuber with paring knife."
  },
  {
    id: 687,
    gloss: "TOMATO",
    english: "Tomato",
    category: "shopping_food",
    description: "Red sign on cheek followed by slicing juicy round vegetable."
  },
  {
    id: 688,
    gloss: "ONION",
    english: "Onion / Pyaz",
    category: "shopping_food",
    description: "Layered bulb sliced with tears forming in eyes."
  },
  {
    id: 689,
    gloss: "GARLIC",
    english: "Garlic / Lahsun",
    category: "shopping_food",
    description: "Small pungent cloves separated and crushed."
  },
  {
    id: 690,
    gloss: "GINGER",
    english: "Ginger / Adrak",
    category: "shopping_food",
    description: "Gnarly root scraped and grated into tea."
  },
  {
    id: 691,
    gloss: "CHILLI",
    english: "Chilli / Mirchi",
    category: "shopping_food",
    description: "Tiny hot pod touching tongue with burning heat wave."
  },
  {
    id: 692,
    gloss: "SPINACH",
    english: "Spinach / Palak",
    category: "shopping_food",
    description: "Green leaves chopped and folded into nutritious sabzi."
  },
  {
    id: 693,
    gloss: "CARROT",
    english: "Carrot",
    category: "shopping_food",
    description: "Orange cone gnawed on like a rabbit."
  },
  {
    id: 694,
    gloss: "CAULIFLOWER",
    english: "Cauliflower",
    category: "shopping_food",
    description: "White compact florets broken apart."
  },
  {
    id: 695,
    gloss: "CABBAGE",
    english: "Cabbage",
    category: "shopping_food",
    description: "Tight round ball of overlapping leaves shredded."
  },
  {
    id: 696,
    gloss: "PEAS",
    english: "Green peas",
    category: "shopping_food",
    description: "Popping green pearls out of fresh pod."
  },
  {
    id: 697,
    gloss: "CORIANDER",
    english: "Coriander / Dhaniya",
    category: "shopping_food",
    description: "Fragrant green herb sprinkled across cooked curry."
  },
  {
    id: 698,
    gloss: "MINT",
    english: "Mint / Pudina",
    category: "shopping_food",
    description: "Refreshing aromatic leaves crushed for chutney."
  },
  {
    id: 699,
    gloss: "CUCUMBER",
    english: "Cucumber",
    category: "shopping_food",
    description: "Cool crisp vegetable sliced into refreshing rounds."
  },
  {
    id: 700,
    gloss: "LEMON",
    english: "Lemon / Nimbu",
    category: "shopping_food",
    description: "Half citrus fruit squeezed dripping tart sour juice."
  },
  {
    id: 701,
    gloss: "APPLE",
    english: "Apple",
    category: "shopping_food",
    description: "X-knuckle twists into dimple of cheek twice."
  },
  {
    id: 702,
    gloss: "BANANA",
    english: "Banana",
    category: "shopping_food",
    description: "Non-dominant index peeled downward in three strips."
  },
  {
    id: 703,
    gloss: "MANGO",
    english: "Mango / Aam",
    category: "shopping_food",
    description: "Juicy king of fruits sliced and savored sweet."
  },
  {
    id: 704,
    gloss: "ORANGE_FRUIT",
    english: "Orange fruit",
    category: "shopping_food",
    description: "C-fist squeezes near mouth like fresh orange juice."
  },
  {
    id: 705,
    gloss: "GRAPES",
    english: "Grapes",
    category: "shopping_food",
    description: "Curved fingers pluck juicy fruit off hanging vine cluster."
  },
  {
    id: 706,
    gloss: "PAPAYA",
    english: "Papaya",
    category: "shopping_food",
    description: "Long melon split open scooping out black seeds."
  },
  {
    id: 707,
    gloss: "GUAVA",
    english: "Guava",
    category: "shopping_food",
    description: "Crunchy fruit bitten into with sweet pink pulp."
  },
  {
    id: 708,
    gloss: "PINEAPPLE",
    english: "Pineapple",
    category: "shopping_food",
    description: "Spiky crown topped tropical fruit cut into rings."
  },
  {
    id: 709,
    gloss: "WATERMELON",
    english: "Watermelon",
    category: "shopping_food",
    description: "Large heavy sphere sliced into wide juicy grin rind."
  },
  {
    id: 710,
    gloss: "POMEGRANATE",
    english: "Pomegranate / Anar",
    category: "shopping_food",
    description: "Hard ruby red fruit opened revealing sparkling arils."
  },
  {
    id: 711,
    gloss: "COCONUT",
    english: "Coconut / Nariyal",
    category: "shopping_food",
    description: "Hard husk cracked open drinking refreshing coconut water."
  },
  {
    id: 712,
    gloss: "BUTTER",
    english: "Butter / Makkhan",
    category: "shopping_food",
    description: "Two fingers spread rich yellow butter onto bread."
  },
  {
    id: 713,
    gloss: "GHEE",
    english: "Ghee / Clarified butter",
    category: "shopping_food",
    description: "Golden pure melted butter poured onto hot dal."
  },
  {
    id: 714,
    gloss: "PANEER_CHEESE",
    english: "Paneer / Cottage cheese",
    category: "shopping_food",
    description: "Fresh white milk curd pressed into firm cubes."
  },
  {
    id: 715,
    gloss: "CURD_YOGURT",
    english: "Curd / Dahi",
    category: "shopping_food",
    description: "Cool creamy yogurt scooped with spoon."
  },
  {
    id: 716,
    gloss: "EGG",
    english: "Egg",
    category: "shopping_food",
    description: "Both H-hands crack imaginary shell apart cleanly."
  },
  {
    id: 717,
    gloss: "CHICKEN_MEAT",
    english: "Chicken",
    category: "shopping_food",
    description: "Beak pecks at palm followed by cooked drumstick bite."
  },
  {
    id: 718,
    gloss: "MUTTON_MEAT",
    english: "Mutton / Lamb",
    category: "shopping_food",
    description: "Meat sliced into rich tender festive curry."
  },
  {
    id: 719,
    gloss: "FISH_FOOD",
    english: "Fish",
    category: "shopping_food",
    description: "Hand swishes like fish fin through water, then cooked."
  },
  {
    id: 720,
    gloss: "SEAFOOD",
    english: "Seafood",
    category: "shopping_food",
    description: "Fresh catch from ocean nets prepared for feast."
  },
  {
    id: 721,
    gloss: "PRAWNS",
    english: "Prawns / Shrimp",
    category: "shopping_food",
    description: "Curved hooked finger swimming backward."
  },
  {
    id: 722,
    gloss: "SOUP",
    english: "Soup",
    category: "shopping_food",
    description: "Spoon scoops steaming hot broth out of deep bowl."
  },
  {
    id: 723,
    gloss: "SALAD",
    english: "Salad",
    category: "shopping_food",
    description: "Both hands toss crispy raw vegetables with dressing."
  },
  {
    id: 724,
    gloss: "SANDWICH",
    english: "Sandwich",
    category: "shopping_food",
    description: "Two slices of bread pressed together with savory filling."
  },
  {
    id: 725,
    gloss: "BURGER",
    english: "Burger",
    category: "shopping_food",
    description: "Both hands clamp thick round bun taking enormous bite."
  },
  {
    id: 726,
    gloss: "PIZZA",
    english: "Pizza",
    category: "shopping_food",
    description: "Z-hand draws triangular slice lifted with melting cheese."
  },
  {
    id: 727,
    gloss: "NOODLES",
    english: "Noodles",
    category: "shopping_food",
    description: "Two index fingers twirl imaginary spaghetti onto fork."
  },
  {
    id: 728,
    gloss: "PASTA",
    english: "Pasta",
    category: "shopping_food",
    description: "Spiral macaroni shapes tossed in tomato garlic sauce."
  },
  {
    id: 729,
    gloss: "SAMOSA",
    english: "Samosa",
    category: "shopping_food",
    description: "Both hands pinch triangular pastry fried golden crisp."
  },
  {
    id: 730,
    gloss: "DOSA",
    english: "Dosa",
    category: "shopping_food",
    description: "Batter spread in wide golden crepe rolled hot off griddle."
  },
  {
    id: 731,
    gloss: "IDLI",
    english: "Idli",
    category: "shopping_food",
    description: "Soft fluffy steamed white rice cake dipped in sambar."
  },
  {
    id: 732,
    gloss: "VADA",
    english: "Vada",
    category: "shopping_food",
    description: "Crisp savory lentil donut fried with golden hole."
  },
  {
    id: 733,
    gloss: "CURRY",
    english: "Curry / Gravy",
    category: "shopping_food",
    description: "Rich spiced aromatic sauce spooned over rice."
  },
  {
    id: 734,
    gloss: "PICKLE",
    english: "Pickle / Achar",
    category: "shopping_food",
    description: "Spicy tangy oil-preserved condiment tasted on fingertip."
  },
  {
    id: 735,
    gloss: "PAPAD",
    english: "Papad",
    category: "shopping_food",
    description: "Thin crisp cracker snapped into crunchy shards."
  },
  {
    id: 736,
    gloss: "SWEETS_MITHAI",
    english: "Indian Sweets / Mithai",
    category: "shopping_food",
    description: "Delicate festive confection passed on silver tray."
  },
  {
    id: 737,
    gloss: "GULAB_JAMUN",
    english: "Gulab Jamun",
    category: "shopping_food",
    description: "Warm golden milk berry soaked in rose cardamom syrup."
  },
  {
    id: 738,
    gloss: "JALEBI",
    english: "Jalebi",
    category: "shopping_food",
    description: "Spiraling saffron loops fried crisp and soaked in sugar."
  },
  {
    id: 739,
    gloss: "ICE_CREAM",
    english: "Ice cream",
    category: "shopping_food",
    description: "Fist holds waffle cone licking cold creamy scoop."
  },
  {
    id: 740,
    gloss: "CHOCOLATE",
    english: "Chocolate",
    category: "shopping_food",
    description: "C-hand circles back of wrist savoring rich cocoa."
  },
  {
    id: 741,
    gloss: "BISCUIT_COOKIE",
    english: "Biscuit / Cookie",
    category: "shopping_food",
    description: "C-hand twists against elbow like cutting biscuit dough."
  },
  {
    id: 742,
    gloss: "CAKE",
    english: "Cake",
    category: "shopping_food",
    description: "Curved fingers cut slice out of tiered birthday cake."
  },
  {
    id: 743,
    gloss: "JUICE",
    english: "Juice",
    category: "shopping_food",
    description: "J-hand drawn on cheek followed by drinking from straw."
  },
  {
    id: 744,
    gloss: "WATER_GLASS",
    english: "Glass of water",
    category: "shopping_food",
    description: "Tumbler held and sipped cleanly."
  },
  {
    id: 745,
    gloss: "BOTTLE",
    english: "Bottle",
    category: "shopping_food",
    description: "Hands trace tall cylindrical neck with twist cap."
  },
  {
    id: 746,
    gloss: "PLATE",
    english: "Plate",
    category: "shopping_food",
    description: "Both hands trace wide flat circular dining rim."
  },
  {
    id: 747,
    gloss: "BOWL",
    english: "Bowl",
    category: "shopping_food",
    description: "Both cupped hands form deep rounded container."
  },
  {
    id: 748,
    gloss: "SPOON",
    english: "Spoon",
    category: "shopping_food",
    description: "Curved fingers scoop liquid lifting to mouth."
  },
  {
    id: 749,
    gloss: "FORK",
    english: "Fork",
    category: "shopping_food",
    description: "V-fingers spear food cleanly."
  },
  {
    id: 750,
    gloss: "KNIFE",
    english: "Knife",
    category: "shopping_food",
    description: "Index finger slices across edge of non-dominant hand."
  },
  {
    id: 751,
    gloss: "CUP",
    english: "Cup / Mug",
    category: "shopping_food",
    description: "C-hand rests on flat palm saucer lifting by handle."
  },
  {
    id: 752,
    gloss: "GLASS_TUMBLER",
    english: "Glass tumbler",
    category: "shopping_food",
    description: "C-cylinder held in hand raised to lips."
  },
  {
    id: 753,
    gloss: "PAN",
    english: "Frying pan",
    category: "shopping_food",
    description: "Flat skillet held by long handle flipped on stove."
  },
  {
    id: 754,
    gloss: "POT",
    english: "Cooking pot",
    category: "shopping_food",
    description: "Deep vessel with two side ear handles."
  },
  {
    id: 755,
    gloss: "PRESSURE_COOKER",
    english: "Pressure cooker",
    category: "shopping_food",
    description: "Lid clamped shut with whistle hissing steam high."
  },
  {
    id: 756,
    gloss: "STOVE_GAS",
    english: "Gas stove",
    category: "shopping_food",
    description: "Knob clicked turning on blue burner flames."
  },
  {
    id: 757,
    gloss: "REFRIGERATOR_FRIDGE",
    english: "Refrigerator / Fridge",
    category: "shopping_food",
    description: "Tall double doors open into cold interior."
  },
  {
    id: 758,
    gloss: "MICROWAVE",
    english: "Microwave oven",
    category: "shopping_food",
    description: "Door opens, food plate enters, timer beeps warm."
  },
  {
    id: 759,
    gloss: "SUPERMARKET",
    english: "Supermarket",
    category: "shopping_food",
    description: "Pushing grocery trolley down wide stocked aisles."
  },
  {
    id: 760,
    gloss: "MALL",
    english: "Shopping mall",
    category: "shopping_food",
    description: "Multi-level glass shopping complex with escalators."
  },
  {
    id: 761,
    gloss: "GROCERY_STORE",
    english: "Grocery store",
    category: "shopping_food",
    description: "Neighborhood kirana shop weighing grains on scale."
  },
  {
    id: 762,
    gloss: "CLOTHING_STORE",
    english: "Clothing boutique",
    category: "shopping_food",
    description: "Racks of garments browsed on hangers."
  },
  {
    id: 763,
    gloss: "FOOTWEAR_STORE",
    english: "Shoe shop",
    category: "shopping_food",
    description: "Trying on new shoes laced onto feet."
  },
  {
    id: 764,
    gloss: "HARDWARE_STORE",
    english: "Hardware store",
    category: "shopping_food",
    description: "Tools, screws, bolts and paint cans."
  },
  {
    id: 765,
    gloss: "BOOKSTORE",
    english: "Bookstore",
    category: "shopping_food",
    description: "Shelves of books opened and inspected."
  },
  {
    id: 766,
    gloss: "DISCOUNT_COUPON",
    english: "Coupon / Voucher",
    category: "shopping_food",
    description: "Paper voucher stamped reducing billing total."
  },
  {
    id: 767,
    gloss: "QR_CODE",
    english: "QR code",
    category: "shopping_food",
    description: "Phone camera frames square pixel barcode scanning payment."
  },
  {
    id: 768,
    gloss: "UPI_PAYMENT",
    english: "UPI digital payment",
    category: "shopping_food",
    description: "Instant digital transfer confirmed with chime."
  },
  {
    id: 769,
    gloss: "ONLINE_PAYMENT",
    english: "Online netbanking",
    category: "shopping_food",
    description: "Secure pin entered completing web order."
  },
  {
    id: 770,
    gloss: "CREDIT_CARD",
    english: "Credit card",
    category: "shopping_food",
    description: "Plastic card swiped through payment terminal."
  },
  {
    id: 771,
    gloss: "DEBIT_CARD",
    english: "Debit card",
    category: "shopping_food",
    description: "Bank card inserted into chip reader."
  },
  {
    id: 772,
    gloss: "ATM_MACHINE",
    english: "ATM machine",
    category: "shopping_food",
    description: "Card inserted, pin punched, banknotes dispensed."
  },
  {
    id: 773,
    gloss: "WALLET_PURSE",
    english: "Wallet / Purse",
    category: "shopping_food",
    description: "Pocketbook unzipped counting stored cash."
  },
  {
    id: 774,
    gloss: "POCKET",
    english: "Pocket",
    category: "shopping_food",
    description: "Hand slips into shirt or trouser pocket."
  },
  {
    id: 775,
    gloss: "PRICE_TAG",
    english: "Price tag",
    category: "shopping_food",
    description: "Tag hanging from collar checked for cost."
  },
  {
    id: 776,
    gloss: "WARRANTY",
    english: "Warranty card",
    category: "shopping_food",
    description: "Official guarantee certificate promising free repair."
  },
  {
    id: 777,
    gloss: "GUARANTEE",
    english: "Guarantee",
    category: "shopping_food",
    description: "Firm handshake guaranteeing reliable quality."
  },
  {
    id: 778,
    gloss: "EXCHANGE_OFFER",
    english: "Exchange offer",
    category: "shopping_food",
    description: "Old item traded in discounting brand new upgrade."
  },
  {
    id: 779,
    gloss: "COTTON_FABRIC",
    english: "Cotton fabric",
    category: "shopping_food",
    description: "Breathable natural cotton weave soft against skin."
  },
  {
    id: 780,
    gloss: "SILK_FABRIC",
    english: "Silk fabric",
    category: "shopping_food",
    description: "Lustrous smooth woven silk gliding through fingers."
  },
  {
    id: 781,
    gloss: "WOOL_FABRIC",
    english: "Wool fabric",
    category: "shopping_food",
    description: "Warm knitted winter yarn cozy against frost."
  },
  {
    id: 782,
    gloss: "JEANS",
    english: "Jeans / Denim",
    category: "shopping_food",
    description: "Sturdy blue denim trousers buttoned at waist."
  },
  {
    id: 783,
    gloss: "TROUSERS",
    english: "Trousers / Slacks",
    category: "shopping_food",
    description: "Tailored formal pants pressed with sharp pleat."
  },
  {
    id: 784,
    gloss: "PANTS",
    english: "Pants",
    category: "shopping_food",
    description: "Hands pull trousers up legs buckling belt."
  },
  {
    id: 785,
    gloss: "T_SHIRT",
    english: "T-shirt",
    category: "shopping_food",
    description: "Short sleeves outlined over collarless torso."
  },
  {
    id: 786,
    gloss: "JACKET",
    english: "Jacket",
    category: "shopping_food",
    description: "Zip pulled up front of warm outerwear."
  },
  {
    id: 787,
    gloss: "SWEATER",
    english: "Sweater",
    category: "shopping_food",
    description: "Knitted pullover pulled down over head."
  },
  {
    id: 788,
    gloss: "COAT",
    english: "Coat / Blazer",
    category: "shopping_food",
    description: "Lapels folded over chest in formal business attire."
  },
  {
    id: 789,
    gloss: "SUIT_FORMAL",
    english: "Business suit",
    category: "shopping_food",
    description: "Matching blazer and trousers with necktie."
  },
  {
    id: 790,
    gloss: "SAREE",
    english: "Saree",
    category: "shopping_food",
    description: "Six yards of silk draped and pleated gracefully over shoulder."
  },
  {
    id: 791,
    gloss: "KURTA",
    english: "Kurta",
    category: "shopping_food",
    description: "Traditional tunic pulled over shoulders buttoned at neck."
  },
  {
    id: 792,
    gloss: "DUPATTA",
    english: "Dupatta / Scarf",
    category: "shopping_food",
    description: "Light fabric draped across both shoulders."
  },
  {
    id: 793,
    gloss: "CAP_HAT",
    english: "Cap / Hat",
    category: "shopping_food",
    description: "Curved brim adjusted snugly over forehead."
  },
  {
    id: 794,
    gloss: "SOCKS",
    english: "Socks",
    category: "shopping_food",
    description: "Warm tubes pulled up over toes and ankles."
  },
  {
    id: 795,
    gloss: "WRISTWATCH",
    english: "Wristwatch",
    category: "shopping_food",
    description: "Timepiece strapped around wrist checked with glance."
  },
  {
    id: 796,
    gloss: "RING_JEWELRY",
    english: "Finger ring",
    category: "shopping_food",
    description: "Gold band slipped onto fourth finger."
  },
  {
    id: 797,
    gloss: "NECKLACE",
    english: "Necklace",
    category: "shopping_food",
    description: "Gold chain fastened gracefully around neck."
  },
  {
    id: 798,
    gloss: "EARRINGS",
    english: "Earrings",
    category: "shopping_food",
    description: "Sparkling pendants hanging from earlobes."
  },
  {
    id: 799,
    gloss: "GLASSES_SPECS",
    english: "Spectacles / Glasses",
    category: "shopping_food",
    description: "Frame resting over bridge of nose hooked over ears."
  },
  {
    id: 800,
    gloss: "SUNGLASSES",
    english: "Sunglasses",
    category: "shopping_food",
    description: "Dark tinted shades shielding eyes from bright glare."
  },
  {
    id: 801,
    gloss: "KINDERGARTEN",
    english: "Kindergarten",
    category: "education_work",
    description: "Little children playing with colorful alphabet blocks."
  },
  {
    id: 802,
    gloss: "HIGH_SCHOOL",
    english: "High school",
    category: "education_work",
    description: "Older students carrying textbooks in hallways."
  },
  {
    id: 803,
    gloss: "UNIVERSITY_CAMPUS",
    english: "University campus",
    category: "education_work",
    description: "Sprawling grounds with faculties and research centers."
  },
  {
    id: 804,
    gloss: "CAMPUS_GROUNDS",
    english: "Campus grounds",
    category: "education_work",
    description: "Open green quads between lecture halls."
  },
  {
    id: 805,
    gloss: "LIBRARY",
    english: "Library",
    category: "education_work",
    description: "L-hand circles in quiet reading hall of book stacks."
  },
  {
    id: 806,
    gloss: "LABORATORY",
    english: "Laboratory",
    category: "education_work",
    description: "Test tubes and microscopes conducting experimental research."
  },
  {
    id: 807,
    gloss: "PRINCIPAL",
    english: "Principal / Headmaster",
    category: "education_work",
    description: "P-hand taps shoulder twice leading school."
  },
  {
    id: 808,
    gloss: "DIRECTOR",
    english: "Director",
    category: "education_work",
    description: "Both D-hands steer organizational vision forward."
  },
  {
    id: 809,
    gloss: "PROFESSOR",
    english: "Professor",
    category: "education_work",
    description: "Distinguished academic lecturing at podium."
  },
  {
    id: 810,
    gloss: "LECTURE",
    english: "Lecture / Presentation",
    category: "education_work",
    description: "Open flat hand gestures explaining complex theories."
  },
  {
    id: 811,
    gloss: "SYLLABUS",
    english: "Syllabus / Curriculum",
    category: "education_work",
    description: "Outline of academic courses and study modules."
  },
  {
    id: 812,
    gloss: "DEGREE_DIPLOMA",
    english: "Degree / Diploma",
    category: "education_work",
    description: "Both hands unroll official graduation parchment scroll."
  },
  {
    id: 813,
    gloss: "GRADUATION",
    english: "Graduation convocation",
    category: "education_work",
    description: "Mortarboard cap thrown high into sky."
  },
  {
    id: 814,
    gloss: "CERTIFICATE",
    english: "Certificate",
    category: "education_work",
    description: "Official accredited document stamped with gold seal."
  },
  {
    id: 815,
    gloss: "SCHOLARSHIP",
    english: "Scholarship award",
    category: "education_work",
    description: "Educational grant funding tuition fees."
  },
  {
    id: 816,
    gloss: "ADMISSION",
    english: "Admission enrollment",
    category: "education_work",
    description: "Application accepted granting entry to student."
  },
  {
    id: 817,
    gloss: "FEES",
    english: "Tuition fees",
    category: "education_work",
    description: "Semester payment submitted to college bursar."
  },
  {
    id: 818,
    gloss: "TUITION_CLASS",
    english: "Tuition class / Coaching",
    category: "education_work",
    description: "Extra academic coaching after school."
  },
  {
    id: 819,
    gloss: "ATTENDANCE",
    english: "Attendance roll call",
    category: "education_work",
    description: "Names called out with hand raised present."
  },
  {
    id: 820,
    gloss: "MARKS_GRADE",
    english: "Marks / Grades",
    category: "education_work",
    description: "Scores tallied at top of exam paper."
  },
  {
    id: 821,
    gloss: "PASSED_EXAM",
    english: "Passed exam",
    category: "education_work",
    description: "Triumphant stamp of success on report card."
  },
  {
    id: 822,
    gloss: "FAILED_EXAM",
    english: "Failed exam",
    category: "education_work",
    description: "Unsuccessful attempt requiring re-examination."
  },
  {
    id: 823,
    gloss: "DESK_FURNITURE",
    english: "Study desk",
    category: "education_work",
    description: "Sturdy wooden table for writing and study."
  },
  {
    id: 824,
    gloss: "CHAIR_FURNITURE",
    english: "Chair",
    category: "education_work",
    description: "Seat with backrest for working at desk."
  },
  {
    id: 825,
    gloss: "BLACKBOARD",
    english: "Blackboard",
    category: "education_work",
    description: "Chalk writes math equations across slate board."
  },
  {
    id: 826,
    gloss: "WHITEBOARD",
    english: "Whiteboard",
    category: "education_work",
    description: "Dry erase marker diagrams flowcharts."
  },
  {
    id: 827,
    gloss: "CHALK_PIECE",
    english: "Chalk",
    category: "education_work",
    description: "Slender white stick writing on chalkboard."
  },
  {
    id: 828,
    gloss: "MARKER_PEN",
    english: "Marker pen",
    category: "education_work",
    description: "Felt tip draws bold lines on whiteboard."
  },
  {
    id: 829,
    gloss: "ERASER_DUSTER",
    english: "Eraser / Duster",
    category: "education_work",
    description: "Felt pad wipes board clean of notes."
  },
  {
    id: 830,
    gloss: "RULER_SCALE",
    english: "Ruler / Scale",
    category: "education_work",
    description: "Straight wooden edge guides accurate line."
  },
  {
    id: 831,
    gloss: "SHARPENER",
    english: "Pencil sharpener",
    category: "education_work",
    description: "Pencil twists inside tiny blade sharpening lead."
  },
  {
    id: 832,
    gloss: "BACKPACK",
    english: "Backpack",
    category: "education_work",
    description: "Dual shoulder straps hauled onto back filled with books."
  },
  {
    id: 833,
    gloss: "COMPANY_FIRM",
    english: "Company / Firm",
    category: "education_work",
    description: "Both C-hands outline corporate headquarters."
  },
  {
    id: 834,
    gloss: "ORGANIZATION",
    english: "Organization",
    category: "education_work",
    description: "Both O-hands link structured departments."
  },
  {
    id: 835,
    gloss: "FACTORY",
    english: "Factory / Plant",
    category: "education_work",
    description: "Interlocking chimneys puffing productive industrial smoke."
  },
  {
    id: 836,
    gloss: "WORKSHOP_GARAGE",
    english: "Workshop",
    category: "education_work",
    description: "Hands crafting and repairing machinery at workbench."
  },
  {
    id: 837,
    gloss: "CLIENT_OFFICE",
    english: "Client office",
    category: "education_work",
    description: "Visiting corporate partner for contract discussions."
  },
  {
    id: 838,
    gloss: "DESK_CABIN",
    english: "Office cabin",
    category: "education_work",
    description: "Partitioned personal workspace with computer desk."
  },
  {
    id: 839,
    gloss: "CONFERENCE_ROOM",
    english: "Conference room",
    category: "education_work",
    description: "Large boardroom table with video conferencing projector."
  },
  {
    id: 840,
    gloss: "LAPTOP_DEVICE",
    english: "Laptop computer",
    category: "education_work",
    description: "Screen hinges open with keyboard ready."
  },
  {
    id: 841,
    gloss: "TABLET_DEVICE",
    english: "Tablet device",
    category: "education_work",
    description: "Flat touchscreen tapped with stylus."
  },
  {
    id: 842,
    gloss: "SMARTPHONE",
    english: "Smartphone",
    category: "education_work",
    description: "Pocket screen unlocked with fingerprint sensor."
  },
  {
    id: 843,
    gloss: "PRINTER",
    english: "Printer",
    category: "education_work",
    description: "Fresh printed paper emerges gliding from tray."
  },
  {
    id: 844,
    gloss: "SCANNER",
    english: "Scanner",
    category: "education_work",
    description: "Glass bed scans document digitizing image."
  },
  {
    id: 845,
    gloss: "MONITOR_SCREEN",
    english: "Monitor screen",
    category: "education_work",
    description: "High resolution display showing code."
  },
  {
    id: 846,
    gloss: "KEYBOARD_TYPING",
    english: "Keyboard",
    category: "education_work",
    description: "Keys depressed in rapid fluid typing."
  },
  {
    id: 847,
    gloss: "MOUSE_CLICK",
    english: "Computer mouse",
    category: "education_work",
    description: "Palm rests on mouse with index finger clicking."
  },
  {
    id: 848,
    gloss: "CHARGER_CABLE",
    english: "Power charger",
    category: "education_work",
    description: "Plug connects phone into electrical wall outlet."
  },
  {
    id: 849,
    gloss: "CABLE_WIRE",
    english: "Cable wire",
    category: "education_work",
    description: "Flexible insulated cord transmitting signals."
  },
  {
    id: 850,
    gloss: "BATTERY_POWER",
    english: "Battery pack",
    category: "education_work",
    description: "Rechargeable energy cell powering electronics."
  },
  {
    id: 851,
    gloss: "HEADPHONES",
    english: "Headphones",
    category: "education_work",
    description: "Padded audio cushions cover ears."
  },
  {
    id: 852,
    gloss: "MICROPHONE",
    english: "Microphone",
    category: "education_work",
    description: "Handheld mic capturing crystal clear speech."
  },
  {
    id: 853,
    gloss: "WEBCAM_CAMERA",
    english: "Webcam",
    category: "education_work",
    description: "Small camera perched atop monitor streaming video."
  },
  {
    id: 854,
    gloss: "SOFTWARE_APP",
    english: "Software application",
    category: "education_work",
    description: "Code compiling into installed running program."
  },
  {
    id: 855,
    gloss: "WEBSITE_PORTAL",
    english: "Website / Web page",
    category: "education_work",
    description: "Browser address bar navigating to portal."
  },
  {
    id: 856,
    gloss: "PASSWORD",
    english: "Password / Security PIN",
    category: "education_work",
    description: "Secret asterisks typed into protected field."
  },
  {
    id: 857,
    gloss: "USERNAME",
    english: "Username / Login ID",
    category: "education_work",
    description: "Unique identity entered to authenticate account."
  },
  {
    id: 858,
    gloss: "DATA_STORAGE",
    english: "Data / Database",
    category: "education_work",
    description: "Cylindrical database icon storing digital records."
  },
  {
    id: 859,
    gloss: "FILE_FOLDER",
    english: "File folder",
    category: "education_work",
    description: "Manila tabbed folder organizing paperwork."
  },
  {
    id: 860,
    gloss: "DOCUMENT_PAGE",
    english: "Document",
    category: "education_work",
    description: "Official typed page with letterhead and terms."
  },
  {
    id: 861,
    gloss: "CONTRACT_AGREEMENT",
    english: "Contract agreement",
    category: "education_work",
    description: "Legal document signed by both parties."
  },
  {
    id: 862,
    gloss: "SIGNATURE",
    english: "Signature / Sign",
    category: "education_work",
    description: "Pen glides in unique flourishing autograph."
  },
  {
    id: 863,
    gloss: "RESUME_CV",
    english: "Resume / CV",
    category: "education_work",
    description: "Professional profile summarizing career experience."
  },
  {
    id: 864,
    gloss: "INTERVIEW_JOB",
    english: "Job interview",
    category: "education_work",
    description: "Formal candidate questioning across interview desk."
  },
  {
    id: 865,
    gloss: "PROMOTION_JOB",
    english: "Job promotion",
    category: "education_work",
    description: "Career leap to higher executive responsibility."
  },
  {
    id: 866,
    gloss: "BONUS_SALARY",
    english: "Salary bonus",
    category: "education_work",
    description: "Extra financial reward celebrating great performance."
  },
  {
    id: 867,
    gloss: "RESIGNATION",
    english: "Resignation",
    category: "education_work",
    description: "Formal notice letter submitted ending employment."
  },
  {
    id: 868,
    gloss: "RETIREMENT",
    english: "Retirement",
    category: "education_work",
    description: "Golden career conclusion relaxing after decades of work."
  },
  {
    id: 869,
    gloss: "MONDAY",
    english: "Monday",
    category: "time_calendar",
    description: "M-hand circles clockwise in front of chest."
  },
  {
    id: 870,
    gloss: "TUESDAY",
    english: "Tuesday",
    category: "time_calendar",
    description: "T-hand circles clockwise in front of chest."
  },
  {
    id: 871,
    gloss: "WEDNESDAY",
    english: "Wednesday",
    category: "time_calendar",
    description: "W-hand circles clockwise in front of chest."
  },
  {
    id: 872,
    gloss: "THURSDAY",
    english: "Thursday",
    category: "time_calendar",
    description: "H-hand or T-H sequence circles clockwise."
  },
  {
    id: 873,
    gloss: "FRIDAY",
    english: "Friday",
    category: "time_calendar",
    description: "F-hand circles clockwise in front of chest."
  },
  {
    id: 874,
    gloss: "SATURDAY",
    english: "Saturday",
    category: "time_calendar",
    description: "S-fist circles clockwise in front of chest."
  },
  {
    id: 875,
    gloss: "SUNDAY",
    english: "Sunday",
    category: "time_calendar",
    description: "Both open palms face forward at shoulder height."
  },
  {
    id: 876,
    gloss: "WEEKEND",
    english: "Weekend",
    category: "time_calendar",
    description: "Week sign sliding across palm ending in rest."
  },
  {
    id: 877,
    gloss: "WEEKDAY",
    english: "Weekday",
    category: "time_calendar",
    description: "Monday through Friday work routine."
  },
  {
    id: 878,
    gloss: "JANUARY",
    english: "January",
    category: "time_calendar",
    description: "Month 1 kicking off the new calendar year."
  },
  {
    id: 879,
    gloss: "FEBRUARY",
    english: "February",
    category: "time_calendar",
    description: "Month 2 with 28 or 29 leap days."
  },
  {
    id: 880,
    gloss: "MARCH",
    english: "March",
    category: "time_calendar",
    description: "Month 3 blooming into early spring."
  },
  {
    id: 881,
    gloss: "APRIL",
    english: "April",
    category: "time_calendar",
    description: "Month 4 with pleasant warm breeze."
  },
  {
    id: 882,
    gloss: "MAY",
    english: "May",
    category: "time_calendar",
    description: "Month 5 blossoming with summer heat."
  },
  {
    id: 883,
    gloss: "JUNE",
    english: "June",
    category: "time_calendar",
    description: "Month 6 welcoming the monsoon arrival."
  },
  {
    id: 884,
    gloss: "JULY",
    english: "July",
    category: "time_calendar",
    description: "Month 7 with heavy lush rains."
  },
  {
    id: 885,
    gloss: "AUGUST",
    english: "August",
    category: "time_calendar",
    description: "Month 8 celebrating Independence Day."
  },
  {
    id: 886,
    gloss: "SEPTEMBER",
    english: "September",
    category: "time_calendar",
    description: "Month 9 with autumn equinox."
  },
  {
    id: 887,
    gloss: "OCTOBER",
    english: "October",
    category: "time_calendar",
    description: "Month 10 with festive celebrations."
  },
  {
    id: 888,
    gloss: "NOVEMBER",
    english: "November",
    category: "time_calendar",
    description: "Month 11 with cooling winter mist."
  },
  {
    id: 889,
    gloss: "DECEMBER",
    english: "December",
    category: "time_calendar",
    description: "Month 12 concluding the annual calendar."
  },
  {
    id: 890,
    gloss: "SPRING_SEASON",
    english: "Spring season",
    category: "time_calendar",
    description: "Plants sprouting upward blossoming in joy."
  },
  {
    id: 891,
    gloss: "SUMMER_SEASON",
    english: "Summer season",
    category: "time_calendar",
    description: "Blazing sun wiping sweat from brow."
  },
  {
    id: 892,
    gloss: "MONSOON_RAINY",
    english: "Monsoon / Rainy season",
    category: "time_calendar",
    description: "Heavy clouds pouring rhythmic raindrops down."
  },
  {
    id: 893,
    gloss: "AUTUMN_SEASON",
    english: "Autumn season",
    category: "time_calendar",
    description: "Golden leaves drifting softly to earth."
  },
  {
    id: 894,
    gloss: "WINTER_SEASON",
    english: "Winter season",
    category: "time_calendar",
    description: "Shivering arms crossed against chilly frost."
  },
  {
    id: 895,
    gloss: "DAWN",
    english: "Dawn / First light",
    category: "time_calendar",
    description: "Sun peeks just above eastern horizon."
  },
  {
    id: 896,
    gloss: "SUNRISE",
    english: "Sunrise",
    category: "time_calendar",
    description: "Golden disc rises radiant above horizontal arm."
  },
  {
    id: 897,
    gloss: "SUNSET",
    english: "Sunset",
    category: "time_calendar",
    description: "Glowing sun sinks below western arm horizon."
  },
  {
    id: 898,
    gloss: "DUSK",
    english: "Dusk / Twilight",
    category: "time_calendar",
    description: "Evening shadows gathering as daylight fades."
  },
  {
    id: 899,
    gloss: "MIDNIGHT",
    english: "Midnight",
    category: "time_calendar",
    description: "12 o’clock downward chime in silent night."
  },
  {
    id: 900,
    gloss: "NOON_TIME",
    english: "Noon / Midday",
    category: "time_calendar",
    description: "Sun straight overhead at 12 o’clock peak."
  },
  {
    id: 901,
    gloss: "SECOND_TIME",
    english: "Second (Time unit)",
    category: "time_calendar",
    description: "Index finger clicks forward one second pulse."
  },
  {
    id: 902,
    gloss: "DECADE",
    english: "Decade",
    category: "time_calendar",
    description: "Ten-year span turning calendar pages."
  },
  {
    id: 903,
    gloss: "CENTURY",
    english: "Century",
    category: "time_calendar",
    description: "One hundred years spanning generations."
  },
  {
    id: 904,
    gloss: "ALWAYS",
    english: "Always / Forever",
    category: "time_calendar",
    description: "Index finger draws endless forward circle."
  },
  {
    id: 905,
    gloss: "OFTEN",
    english: "Often / Frequently",
    category: "time_calendar",
    description: "Fingertips tap forward repeatedly on palm."
  },
  {
    id: 906,
    gloss: "SOMETIMES",
    english: "Sometimes",
    category: "time_calendar",
    description: "Index finger bounces occasionally off flat palm."
  },
  {
    id: 907,
    gloss: "RARELY",
    english: "Rarely / Seldom",
    category: "time_calendar",
    description: "Tiny space between fingers indicating extreme rarity."
  },
  {
    id: 908,
    gloss: "NEVER",
    english: "Never",
    category: "time_calendar",
    description: "Flat hand slices downward in sharp final refusal."
  },
  {
    id: 909,
    gloss: "SOON",
    english: "Soon",
    category: "time_calendar",
    description: "F-hand taps chin lightly indicating impending event."
  },
  {
    id: 910,
    gloss: "EARLY_TIME",
    english: "Early",
    category: "time_calendar",
    description: "Middle finger glides across back of non-dominant fist."
  },
  {
    id: 911,
    gloss: "LATE_TIME",
    english: "Late",
    category: "time_calendar",
    description: "Bent hand flaps downward by waist tardily."
  },
  {
    id: 912,
    gloss: "PUNCTUAL",
    english: "Punctual / On time",
    category: "time_calendar",
    description: "Index taps watch point exactly on the dot."
  },
  {
    id: 913,
    gloss: "SCHEDULE_PLAN",
    english: "Schedule / Timetable",
    category: "time_calendar",
    description: "Grid of time slots mapped neatly on palm."
  },
  {
    id: 914,
    gloss: "WEATHER_NATURE",
    english: "Weather",
    category: "time_calendar",
    description: "Both W-hands twist alternately drifting in atmosphere."
  },
  {
    id: 915,
    gloss: "SUNNY",
    english: "Sunny",
    category: "time_calendar",
    description: "O-hand opens in radiant beam over head."
  },
  {
    id: 916,
    gloss: "RAIN_STORM",
    english: "Rain",
    category: "time_calendar",
    description: "Fingers flutter downward softly like falling drops."
  },
  {
    id: 917,
    gloss: "STORM",
    english: "Storm",
    category: "time_calendar",
    description: "Violent winds whipping clouds and lightning."
  },
  {
    id: 918,
    gloss: "THUNDER",
    english: "Thunder",
    category: "time_calendar",
    description: "Index touches ear then both fists clash with rumble."
  },
  {
    id: 919,
    gloss: "LIGHTNING",
    english: "Lightning",
    category: "time_calendar",
    description: "Index finger zigzags down through sky like electric bolt."
  },
  {
    id: 920,
    gloss: "WIND_BREEZE",
    english: "Wind / Breeze",
    category: "time_calendar",
    description: "Both open hands sway sideways depicting blowing air."
  },
  {
    id: 921,
    gloss: "CLOUD",
    english: "Cloud",
    category: "time_calendar",
    description: "Both claw hands outline fluffy drifting clouds."
  },
  {
    id: 922,
    gloss: "FOG_SMOG",
    english: "Fog / Smog",
    category: "time_calendar",
    description: "Spread fingers cross in front of eyes obscuring vision."
  },
  {
    id: 923,
    gloss: "CONFIDENT",
    english: "Confident",
    category: "feelings_states",
    description: "Both S-hands pull downward firmly at sides standing tall."
  },
  {
    id: 924,
    gloss: "BRAVE",
    english: "Brave / Courageous",
    category: "feelings_states",
    description: "Both claw hands pull outward from chest into strong fists."
  },
  {
    id: 925,
    gloss: "SCARED_AFRAID",
    english: "Scared / Afraid",
    category: "feelings_states",
    description: "Both open hands tremble defensively before chest."
  },
  {
    id: 926,
    gloss: "NERVOUS",
    english: "Nervous",
    category: "feelings_states",
    description: "Hands twitch and fidget with anxious eye darting."
  },
  {
    id: 927,
    gloss: "EXCITED",
    english: "Excited",
    category: "feelings_states",
    description: "Both middle fingers flick upward alternately against chest."
  },
  {
    id: 928,
    gloss: "PROUD",
    english: "Proud",
    category: "feelings_states",
    description: "A-thumb traces straight up center of chest with elevated head."
  },
  {
    id: 929,
    gloss: "JEALOUS",
    english: "Jealous",
    category: "feelings_states",
    description: "X-finger bites corner of mouth with envious grimace."
  },
  {
    id: 930,
    gloss: "ENVIOUS",
    english: "Envious",
    category: "feelings_states",
    description: "Looking sideways with yearning desire for another’s luck."
  },
  {
    id: 931,
    gloss: "DISAPPOINTED",
    english: "Disappointed",
    category: "feelings_states",
    description: "Index finger touches chin as head droops downward."
  },
  {
    id: 932,
    gloss: "GUILTY",
    english: "Guilty",
    category: "feelings_states",
    description: "G-hand strikes chest above heart bearing culpability."
  },
  {
    id: 933,
    gloss: "ASHAMED",
    english: "Ashamed",
    category: "feelings_states",
    description: "Back of hand turns against cheek hiding face in remorse."
  },
  {
    id: 934,
    gloss: "EMBARRASSED",
    english: "Embarrassed",
    category: "feelings_states",
    description: "Hands flush upward across burning red cheeks."
  },
  {
    id: 935,
    gloss: "SURPRISED",
    english: "Surprised",
    category: "feelings_states",
    description: "Both index fingers pop open wide beside widening eyes."
  },
  {
    id: 936,
    gloss: "SHOCKED",
    english: "Shocked",
    category: "feelings_states",
    description: "Jaw drops open as hands clasp sides of face frozen."
  },
  {
    id: 937,
    gloss: "BORED",
    english: "Bored",
    category: "feelings_states",
    description: "Index finger twists at side of nose with weary sigh."
  },
  {
    id: 938,
    gloss: "CALM",
    english: "Calm / Peaceful",
    category: "feelings_states",
    description: "Both flat hands glide downward smoothing troubled waters."
  },
  {
    id: 939,
    gloss: "PATIENT",
    english: "Patient",
    category: "feelings_states",
    description: "A-thumb rests gently against chin enduring steady wait."
  },
  {
    id: 940,
    gloss: "IMPATIENT",
    english: "Impatient",
    category: "feelings_states",
    description: "Fingers drum restlessly on wrist watch."
  },
  {
    id: 941,
    gloss: "KIND",
    english: "Kind / Gentle",
    category: "feelings_states",
    description: "Both hands circle around each other warmly."
  },
  {
    id: 942,
    gloss: "CRUEL",
    english: "Cruel / Mean",
    category: "feelings_states",
    description: "Clawed hand strikes forward like snarling predator."
  },
  {
    id: 943,
    gloss: "POLITE",
    english: "Polite / Courteous",
    category: "feelings_states",
    description: "Thumb of 5-hand brushes chest upward with gentle bow."
  },
  {
    id: 944,
    gloss: "RUDE",
    english: "Rude",
    category: "feelings_states",
    description: "Middle finger scrapes across non-dominant palm insolently."
  },
  {
    id: 945,
    gloss: "HONEST",
    english: "Honest / Truthful",
    category: "feelings_states",
    description: "H-fingers slide straight forward along palm without bend."
  },
  {
    id: 946,
    gloss: "DISHONEST_LIAR",
    english: "Dishonest / Liar",
    category: "feelings_states",
    description: "Index finger slides sideways across chin speaking untruths."
  },
  {
    id: 947,
    gloss: "LOYAL",
    english: "Loyal",
    category: "feelings_states",
    description: "L-hand stamps down upon heart declaring steadfast allegiance."
  },
  {
    id: 948,
    gloss: "GENEROUS",
    english: "Generous",
    category: "feelings_states",
    description: "Both hands pour abundance freely to all in need."
  },
  {
    id: 949,
    gloss: "SELFISH",
    english: "Selfish",
    category: "feelings_states",
    description: "Hooked fingers claw inward snatching all for oneself."
  },
  {
    id: 950,
    gloss: "CLEVER_SMART",
    english: "Clever / Smart",
    category: "feelings_states",
    description: "Index finger taps forehead radiating sharp brilliance."
  },
  {
    id: 951,
    gloss: "STUPID_FOOL",
    english: "Foolish",
    category: "feelings_states",
    description: "V-fingers hook across forehead with rueful shake."
  },
  {
    id: 952,
    gloss: "LAZY",
    english: "Lazy",
    category: "feelings_states",
    description: "L-hand slumps weakly against shoulder lacking effort."
  },
  {
    id: 953,
    gloss: "HARDWORKING",
    english: "Hardworking",
    category: "feelings_states",
    description: "Fists hammer enthusiastically on workbench."
  },
  {
    id: 954,
    gloss: "STRONG",
    english: "Strong / Powerful",
    category: "feelings_states",
    description: "Both bicep fists flex with formidable vigor."
  },
  {
    id: 955,
    gloss: "WEAK",
    english: "Weak / Feeble",
    category: "feelings_states",
    description: "Fingers buckle and collapse unable to support weight."
  },
  {
    id: 956,
    gloss: "TALL",
    english: "Tall",
    category: "feelings_states",
    description: "Hand rises high above head measuring towering stature."
  },
  {
    id: 957,
    gloss: "SHORT_HEIGHT",
    english: "Short (Height)",
    category: "feelings_states",
    description: "Flat hand holds low near waist."
  },
  {
    id: 958,
    gloss: "FAT",
    english: "Heavy / Plump",
    category: "feelings_states",
    description: "Both curved hands puff cheeks and expand outward."
  },
  {
    id: 959,
    gloss: "SLIM_THIN",
    english: "Slim / Slender",
    category: "feelings_states",
    description: "Pinkies pull apart indicating delicate lean frame."
  },
  {
    id: 960,
    gloss: "HEAVY_WEIGHT",
    english: "Heavy weight",
    category: "feelings_states",
    description: "Hands struggle to hoist load from ground."
  },
  {
    id: 961,
    gloss: "LIGHT_WEIGHT",
    english: "Light weight",
    category: "feelings_states",
    description: "Hands bounce featherweight object upward easily."
  },
  {
    id: 962,
    gloss: "DEEP",
    english: "Deep",
    category: "feelings_states",
    description: "Hand plunges far down below horizontal surface."
  },
  {
    id: 963,
    gloss: "SHALLOW",
    english: "Shallow",
    category: "feelings_states",
    description: "Hand floats just beneath surface of water."
  },
  {
    id: 964,
    gloss: "WIDE",
    english: "Wide",
    category: "feelings_states",
    description: "Both flat hands spread far apart horizontally."
  },
  {
    id: 965,
    gloss: "NARROW",
    english: "Narrow",
    category: "feelings_states",
    description: "Both flat hands press closely together parallel."
  },
  {
    id: 966,
    gloss: "THICK",
    english: "Thick",
    category: "feelings_states",
    description: "C-hand measures generous cross-section between fingers."
  },
  {
    id: 967,
    gloss: "THIN",
    english: "Thin",
    category: "feelings_states",
    description: "Index and thumb hold paper-thin sliver."
  },
  {
    id: 968,
    gloss: "HARD_SURFACE",
    english: "Hard",
    category: "feelings_states",
    description: "Knuckles rap against firm immovable solid."
  },
  {
    id: 969,
    gloss: "SOFT_SURFACE",
    english: "Soft",
    category: "feelings_states",
    description: "Both hands squeeze plush velvety cushion."
  },
  {
    id: 970,
    gloss: "ROUGH",
    english: "Rough",
    category: "feelings_states",
    description: "Curved fingers grate across coarse gravel texture."
  },
  {
    id: 971,
    gloss: "SMOOTH",
    english: "Smooth",
    category: "feelings_states",
    description: "Flat palm glides effortlessly across polished marble."
  },
  {
    id: 972,
    gloss: "CLEAN_ADJ",
    english: "Clean / Spotless",
    category: "feelings_states",
    description: "Palm sweeps across base hand leaving immaculate sheen."
  },
  {
    id: 973,
    gloss: "DIRTY",
    english: "Dirty / Filthy",
    category: "feelings_states",
    description: "Back of hand shakes beneath chin spattering grime."
  },
  {
    id: 974,
    gloss: "BRIGHT",
    english: "Bright / Luminous",
    category: "feelings_states",
    description: "Both O-hands burst open radiating brilliant light."
  },
  {
    id: 975,
    gloss: "DARK",
    english: "Dark / Shadowy",
    category: "feelings_states",
    description: "Both open hands cross in front of eyes dimming light."
  },
  {
    id: 976,
    gloss: "SHINY",
    english: "Shiny / Sparkling",
    category: "feelings_states",
    description: "Fingers flutter sparkling like polished gemstone."
  },
  {
    id: 977,
    gloss: "DULL",
    english: "Dull / Matt",
    category: "feelings_states",
    description: "Flat hand descends with muted unreflective tone."
  },
  {
    id: 978,
    gloss: "LOUD",
    english: "Loud / Noisy",
    category: "feelings_states",
    description: "Index touches ear then hands vibrate with thunderous sound."
  },
  {
    id: 979,
    gloss: "QUIET_SILENT",
    english: "Quiet / Silent",
    category: "feelings_states",
    description: "Index finger seals lips with hushed serene calm."
  },
  {
    id: 980,
    gloss: "SWEET_TASTE",
    english: "Sweet taste",
    category: "feelings_states",
    description: "Fingertips stroke down chin savoring sweet honey."
  },
  {
    id: 981,
    gloss: "SOUR",
    english: "Sour",
    category: "feelings_states",
    description: "Lips pucker tightly as index taps cheek in tart reaction."
  },
  {
    id: 982,
    gloss: "BITTER",
    english: "Bitter",
    category: "feelings_states",
    description: "Tongue recoils as hand wipes mouth with unpleasant grimace."
  },
  {
    id: 983,
    gloss: "SALTY",
    english: "Salty",
    category: "feelings_states",
    description: "Fingers sprinkle salt onto tongue tasting savor."
  },
  {
    id: 984,
    gloss: "DELICIOUS",
    english: "Delicious",
    category: "feelings_states",
    description: "Thumb and middle flick outward from lips licking fingers."
  },
  {
    id: 985,
    gloss: "DISGUSTING",
    english: "Disgusting",
    category: "feelings_states",
    description: "Clawed hand twists on stomach with nauseated grimace."
  },
  {
    id: 986,
    gloss: "RICH",
    english: "Rich / Wealthy",
    category: "feelings_states",
    description: "Hand drops thick bundle of banknotes into non-dominant palm."
  },
  {
    id: 987,
    gloss: "POOR",
    english: "Poor / Impoverished",
    category: "feelings_states",
    description: "Fingers pull down ragged sleeve at elbow."
  },
  {
    id: 988,
    gloss: "FAMOUS",
    english: "Famous / Renowned",
    category: "feelings_states",
    description: "Index fingers spiral outward from mouth to worldwide acclaim."
  },
  {
    id: 989,
    gloss: "UNKNOWN",
    english: "Unknown / Obscure",
    category: "feelings_states",
    description: "Hands shrug outward into anonymous shadows."
  },
  {
    id: 990,
    gloss: "IMPORTANT",
    english: "Important",
    category: "feelings_states",
    description: "Both F-hands circle and join together with paramount priority."
  },
  {
    id: 991,
    gloss: "USELESS",
    english: "Useless",
    category: "feelings_states",
    description: "Hand tosses matter over shoulder with dismissive wave."
  },
  {
    id: 992,
    gloss: "DANGEROUS",
    english: "Dangerous",
    category: "feelings_states",
    description: "Warning fists clash warning of perilous threat."
  },
  {
    id: 993,
    gloss: "SAFE_PLACE",
    english: "Safe / Secure",
    category: "feelings_states",
    description: "Hands lock in strong unbreachable protective shelter."
  },
  {
    id: 994,
    gloss: "SPECIAL",
    english: "Special / Unique",
    category: "feelings_states",
    description: "Dominant index finger plucks non-dominant thumb above rest."
  },
  {
    id: 995,
    gloss: "ORDINARY",
    english: "Ordinary / Average",
    category: "feelings_states",
    description: "Hand balances horizontally in median normalcy."
  },
  {
    id: 996,
    gloss: "PERFECT",
    english: "Perfect",
    category: "feelings_states",
    description: "Both P-hands touch circle tips in flawless precision."
  },
  {
    id: 997,
    gloss: "BROKEN",
    english: "Broken / Shattered",
    category: "feelings_states",
    description: "Hands snap item apart with fractured pieces falling."
  },
  {
    id: 998,
    gloss: "EMPTY_ADJ",
    english: "Empty",
    category: "feelings_states",
    description: "Middle finger swipes across bare back of hand showing nothing."
  },
  {
    id: 999,
    gloss: "FULL_ADJ",
    english: "Full / Packed",
    category: "feelings_states",
    description: "Flat palm glides over rim of container brimming to top."
  }
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
  const upper = gloss.trim().toUpperCase().replace(/[\s\/-]+/g, '_');
  return ISL_WORD_LABELS.find(w => w.gloss === upper) || null;
}
