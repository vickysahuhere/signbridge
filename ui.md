# User Interface & Experience Specification (`ui.md`)

**Project**: SignBridge ISL — Real-Time Indian Sign Language (ISL) to Text Chat Application  
**Stack**: React (JavaScript ES6+) + Tailwind CSS + Lucide Icons + HTML5 `<canvas>`

---

## 1. UX Design Principles for Deaf / Hard-of-Hearing (ISL) & Hearing Users

Designing for real-time sign language communication requires solving **Visual Attention Splitting**. Unlike a voice call where a user can look anywhere while listening, an **ISL signer (Person A)** must keep their eyes and upper body facing the webcam while simultaneously reading **Person B's** incoming text replies and verifying that the AI is recognizing their signs accurately.

### Core Ergonomic Rules:
1. **Zero Eye-Travel Subtitle Overlay**: Incoming text messages from Person B must appear **directly on top of (or immediately below) the top edge of Person A's webcam canvas**—right below the laptop's physical camera lens—so Person A never has to look away from the camera to read a side chat panel.
2. **Instant Skeletal & Confidence Feedback**: Person A needs immediate visual proof that both hands are inside the camera's framing box and that the AI is registering their movement. We draw a color-coded skeleton on the `<canvas>`:
   * **Emerald Green (`#10B981`)**: High-confidence sign lock ($\ge 75\%$).
   * **Amber (`#F59E0B`)**: Hands moving / buffering frames (`ACTIVE_SIGNING`).
   * **Slate/Cyan (`#38BDF8`)**: Idle / hands resting (`IDLE_READY`).
   * **Rose Red Border Warning (`#F43F5E`)**: Hands too close to frame edge or lighting too dark.
3. **Live "Gloss Pill" Composition Bar with 1.2s Pause Ring**: As Person A signs individual ISL words (`YOU` $\rightarrow$ `NAME` $\rightarrow$ `WHAT`), each word pops into a live composition bar as a visual pill. When Person A pauses their hands, a smooth **1.2-second circular progress ring** fills up and automatically converts the pills into `"What is your name?"` and sends the message.
4. **Hands-Free Error Correction**: If the AI misrecognizes a word, Person A can either click `[Backspace Last Sign]` or perform a quick "wave/shake" gesture to clear the last token before the 1.2s auto-send timer completes.

---

## 2. Screen-by-Screen Wireframes & Layout

### Screen 1: Landing & Instant Room Creation (`/`)
A clean, zero-friction entry screen requiring no email signup or password.

```text
+-----------------------------------------------------------------------------------+
|  [Logo] SignBridge ISL                                    [Test My Camera] [Docs] |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|             Real-Time Indian Sign Language (ISL) to Text Chat                     |
|        Communicate naturally via webcam. 100% browser-powered & private.          |
|                                                                                   |
|   +-----------------------------------+   +-----------------------------------+   |
|   |  Create or Join a Private Room    |   |  Select Your Primary Role         |   |
|   |                                   |   |                                   |   |
|   |  Room Code: [ isl-maple-42    ]   |   |  (•) Person A: ISL Signer         |   |
|   |  Your Name: [ Aarav           ]   |   |      (Webcam + AI Recognition ON) |   |
|   |                                   |   |                                   |   |
|   |  [ Generate Random Room Link ]    |   |  ( ) Person B: Text Partner       |   |
|   |  [ Enter Communication Room -> ]  |   |      (Fast Text Chat Interface)   |   |
|   +-----------------------------------+   +-----------------------------------+   |
|                                                                                   |
|   [✓] MediaPipe Holistic WebGL Ready   [✓] ISL INCLUDE Model Cached (14.2 MB)     |
+-----------------------------------------------------------------------------------+
```

### Screen 2: Main Communication Workspace (`/room/:roomId`)
A responsive 12-column split layout (`7 columns` for the Vision & Signing Stage on the left, `5 columns` for the Real-Time Conversation & ISL Reference Panel on the right).

```text
+-----------------------------------------------------------------------------------+
| SignBridge ISL | Room: #isl-maple-42 [Copy Link] | ● P2P Connected (18ms) | 28 FPS|
+-------------------------------------------------+---------------------------------+
|  LEFT PANEL: ISL VISION STAGE (7 Cols)          | RIGHT PANEL: LIVE CHAT (5 Cols) |
|                                                 |                                 |
|  +-------------------------------------------+  |  [Chat Tab] [ISL Dictionary (50)|
|  | [HUD: Person B Replied Just Now:]         |  |  -----------------------------  |
|  | "I am doing great! Where are you now?"    |  |  Aarav (ISL -> Text) • 21:14    |
|  +-------------------------------------------+  |  +---------------------------+  |
|  |                                           |  |  | Hello, how are you?       |  |
|  |          [ WEBCAM VIDEO FEED ]            |  |  | [Gloss: HELLO • HOW • YOU]|  |
|  |                  +                        |  |  +---------------------------+  |
|  |     [ 3D HOLISTIC SKELETON OVERLAY ]      |  |                                 |
|  |       (Left Hand: Cyan, Right: Emerald,   |  |  Priya (Text) • 21:14           |
|  |        Upper Pose & Lip Mesh: White)      |  |  +---------------------------+  |
|  |                                           |  |  | I am doing great! Where   |  |
|  |                                           |  |  | are you now?              |  |
|  |  [Top-1: HOSPITAL (91%)] [2: DOCTOR (6%)] |  |  +---------------------------+  |
|  +-------------------------------------------+  |                                 |
|                                                 |  [⚡ Aarav is signing:          |
|  LIVE SIGN BUFFER (Pauses 1.2s to Auto-Send):   |     "ME • HOSPITAL..." ]        |
|  +-------------------------------------------+  |                                 |
|  | [ ME ]  [ HOSPITAL ]  [ GO ]   (⏳ 0.8s)  |  |  Quick Replies:                 |
|  | -> Preview: "I am going to the hospital." |  |  [Yes] [No] [Please repeat]     |
|  +-------------------------------------------+  |  -----------------------------  |
|  | Mode: [● Word Mode (ISL)] [○ A-Z Spell]   |  |  [ Type a message...    ] [Send]|
|  | [⌫ Undo Sign] [✕ Clear] [↵ Send Now]     |  |                                 |
+-------------------------------------------------+---------------------------------+
```

---

## 3. Visual Design System & Color Palette (Dark-First High Contrast)

Because Person A is looking at a webcam feed for extended periods, a **Dark Slate UI** reduces screen glare on their face and makes the glowing skeletal keypoints and subtitle overlays effortless to read.

| Token Name | Hex Code | Tailwind Class | Usage in the UI |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#0F172A` | `bg-slate-900` | Main application background |
| **Elevated Surface** | `#1E293B` | `bg-slate-800` | Chat panel, cards, control bar containers |
| **Glass HUD Overlay** | `rgba(15, 23, 42, 0.78)` | `bg-slate-900/80 backdrop-blur-md` | Incoming text subtitle banner over the top of the webcam |
| **Primary Accent (ISL Word)** | `#10B981` | `bg-emerald-500 text-slate-950` | Confirmed sign pills, high-confidence skeleton joints |
| **Secondary Accent (Left Hand)** | `#38BDF8` | `text-sky-400` | Left-hand skeleton bones & fingerspelling mode badge |
| **Right Hand Skeleton** | `#34D399` | `text-emerald-400` | Right-hand skeleton bones (distinguishes crossed hands in ISL!) |
| **Buffering / Motion State** | `#F59E0B` | `text-amber-400` | Active motion ring & 1.2s pause countdown bar |
| **Alert / Out-of-Frame** | `#F43F5E` | `text-rose-500` | Low confidence or hand out-of-bounds warning |

> **Why Left and Right Hands Must Have Different Colors in ISL**:  
> Since 25 out of 26 ISL alphabet letters and most ISL words are two-handed, rendering the **Left Hand in Sky Blue (`#38BDF8`)** and the **Right Hand in Emerald Green (`#34D399`)** lets the user and developer immediately see if MediaPipe is tracking both hands properly when they cross or touch.

---

## 4. Component Architecture in JavaScript (`src/components/`)

### 4.1 `<SignerStage />` (Webcam + Dual-Layer Canvas)
* Uses a hidden or mirrored `<video>` element (`transform: scaleX(-1)`) paired with a synchronized `<canvas>` overlay of identical dimensions (`640x480`).
* Renders three visual layers on the canvas:
  1. **Framing Guide Box**: A subtle dashed safe-zone box reminding the signer to keep their shoulders and hands inside the frame.
  2. **Color-Coded Holistic Skeleton**: Connects the 21 left-hand joints, 21 right-hand joints, shoulder-to-wrist pose lines, and eyebrow/lip contours.
  3. **Top Subtitle HUD (`<IncomingSubtitleOverlay />`)**: Displays the latest message from Person B in `20px` bold high-contrast text right below the top bezel of the video player.

### 4.2 `<LiveGlossBar />` (Real-Time Sign Composition & Controls)
* Displays the array of currently recognized ISL gloss pills: e.g., `[ ME ]` $\rightarrow$ `[ COLLEGE ]` $\rightarrow$ `[ GO ]`.
* Shows the live **English Translation Preview** underneath: *"I am going to college."*
* Includes an interactive **Mode Switcher**:
  * **`ISL Word Mode`** (Default): Uses the 30-frame temporal model to recognize whole words from the AI4Bharat INCLUDE vocabulary.
  * **`ISL Alphabet Mode (A–Z)`**: Switches to the fast 2-hand static/short-window MLP so Person A can spell out proper nouns (like *"R-A-H-U-L"* or *"D-E-L-H-I"*).

### 4.3 `<ISLReferenceDrawer />` (Built-In Learning & Testing Drawer)
* Crucial for demos, judges, and new users: a collapsible tab in the right panel that lists the **50 core ISL signs** supported by the model (grouped into *Greetings*, *Pronouns*, *Questions*, *Everyday Actions*, and *A–Z Two-Handed Alphabets*), complete with a 1-line visual description of how to perform each sign in front of the camera!
