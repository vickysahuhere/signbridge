# Phase 5: The Linguist - Context

**Gathered:** 2026-11-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 implements the in-browser computational linguistics engine and real-time sentence composition interface for SignBridge ISL. It receives confirmed ISL word glosses and fingerspelled characters from the Web Worker vision pipeline, debounces adjacent duplicate signs, manages an active gloss buffer with manual editing controls (`[Undo Last Sign]`, `[Clear All]`), deterministically reorders ISL Subject-Object-Verb (SOV) sequences and trailing WH-question markers into natural English Subject-Verb-Object (SVO) sentences in pure JavaScript (<1ms latency with zero API costs), and visualizes the 1.2-second pause countdown ring leading to automatic sentence completion.

Networking (WebRTC P2P and Supabase signaling) and remote subtitle overlays belong to Phase 6.
</domain>

<decisions>
## Implementation Decisions

### Gloss Buffer Management & Deduplication (LING-01, LING-02)
- **D-01:** Implement `src/nlp/glossBufferManager.js`:
  - Maintains an array of recognized tokens (`glosses`).
  - Automatically deduplicates repeated adjacent signs (`["HELLO", "HELLO"]` $\rightarrow$ `["HELLO"]`).
  - Supports combining contiguous single-letter alphabet tokens into a single word token (e.g. `['R', 'A', 'H', 'U', 'L']` $\rightarrow$ `'RAHUL'`).
  - Exposes mutation methods:
    - `push(token)`: Adds token with adjacent deduplication.
    - `undo()`: Removes the most recently added token.
    - `clear()`: Empties the buffer.
    - `getGlosses()`: Returns current tokens array.
    - `isEmpty()`: Checks if buffer is empty.

### Deterministic ISL (SOV) to English (SVO) Grammar Engine (LING-03, LING-04)
- **D-02:** Implement `src/nlp/islSentenceFormatter.js` in pure JavaScript:
  - Runs in `<1ms` client-side with zero network latency, zero API keys, and zero runtime cost.
  - Recognizes semantic part-of-speech tags for all 50 vocabulary signs and fingerspelled entities:
    - Pronouns: `I_ME` (`"I"`), `YOU` (`"you"`), `WE` (`"we"`), `THEY` (`"they"`)
    - WH-Questions: `WHAT`, `WHERE`, `WHO`, `WHY`, `WHEN`, `HOW`
    - Verbs/Actions: `GO`, `COME`, `EAT`, `DRINK`, `HELP`, `WORK`, `STUDY`, `SLEEP`, `WAIT`, `SEE`, `KNOW`, `UNDERSTAND`, `WANT`
    - Objects/Places/Nouns: `HOSPITAL`, `DOCTOR`, `MEDICINE`, `POLICE`, `WATER`, `FOOD`, `HOME`, `SCHOOL`, `NAME`, `FRIEND`, `FAMILY`, `TIME`, `TODAY`, `TOMORROW`, `YESTERDAY`
    - Greetings & Politeness: `HELLO`, `GOOD_MORNING`, `WELCOME`, `THANK_YOU`, `PLEASE`, `SORRY`
    - Modifiers/Essentials: `YES`, `NO`, `GOOD`, `BAD`, `HAPPY`, `SAD`
  - Reordering rules:
    - **SOV to SVO transformation**: `Subject + Object + Verb` $\rightarrow$ `Subject + [Aux/Copula] + Verb + Object` (e.g., `["I_ME", "WATER", "WANT"]` $\rightarrow$ `"I want water."`, `["I_ME", "HOSPITAL", "GO"]` $\rightarrow$ `"I am going to the hospital."`).
    - **WH-Final Question Inversion**: ISL places WH-words at the end of clauses. The engine repositions them to the beginning with appropriate copula insertion (e.g., `["YOU", "NAME", "WHAT"]` $\rightarrow$ `"What is your name?"`, `["HOSPITAL", "WHERE"]` $\rightarrow$ `"Where is the hospital?"`, `["YOU", "HOW"]` $\rightarrow$ `"How are you?"`).
    - **Greeting & Politeness Preservation**: Standalone or prefix greetings format cleanly (e.g., `["HELLO", "HOW", "YOU"]` $\rightarrow$ `"Hello, how are you?"`).
    - **Proper Capitalization & Punctuation**: Automatically capitalizes sentence initials and appends terminal punctuation (`.` or `?`).

### Live UI & 1.2s Circular Pause Progress Ring (LING-05)
- **D-03:** Build `src/components/LiveGlossBar.jsx`:
  - Displays token pills for each buffered gloss with delete badges.
  - Displays live English translation preview in real time as signs are recognized.
  - Embeds an SVG circular countdown ring showing the 1.2s pause progress (`motionState.pauseProgress` from 0.0 to 1.0) with remaining countdown in tenths of a second (`⏳ 0.8s`).
  - Action buttons:
    - `[⌫ Undo Sign]`
    - `[✕ Clear All]`
    - `[↵ Send Now]` (immediate manual sentence commit)
- **D-04:** Sentence Commit Event:
  - When `motionState.state === 'IDLE_COMMIT'` (or manual `[Send Now]` is clicked), triggers `onCommitSentence({ glosses, text })`.
  - Clears the gloss buffer ready for the next sentence.
</decisions>

<canonical_refs>
## Canonical References

### Architecture & Linguistic Specifications
- `tech.md` §5 — Deep Learning Concept 4: ISL SOV Grammar to English Reconstruction
- `tech.md` §5.1 — Temporal Debouncer & Deterministic Grammar Engine
- `appflow.md` §4 Step 2 — 1.2-Second Pause Triggers Grammar Conversion & Auto-Send
- `ui.md` §4.2 — `<LiveGlossBar />` (Real-Time Sign Composition & Controls)
- `ui.md` Screen 2 — Main Communication Workspace Wireframe
</canonical_refs>
