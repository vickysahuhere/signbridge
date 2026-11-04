# Phase 1: The Eyes — UI Design Contract

**Phase**: 01-the-eyes  
**Status**: Approved Design Contract  
**Source**: Derived from `ui.md`, `tech.md`, and `appflow.md`

---

## 1. Design System & Theme

### Theme Architecture
- **Palette Style**: Dark Slate High-Contrast (reduces facial glare during webcam signing and highlights glowing skeletal bones).
- **Primary Surface**: `#0F172A` (Tailwind `slate-900`)
- **Card / Elevated Surface**: `#1E293B` (Tailwind `slate-800`)
- **Borders & Dividers**: `#334155` (Tailwind `slate-700`)
- **Typography**: Clean modern sans-serif (`Inter`, `system-ui`), high-legibility tabular numbers for telemetry/FPS.

### Color Tokens for Computer Vision Skeleton
| Anatomical Landmark Group | Hex Color | Tailwind Class | Semantic Purpose in ISL |
| :--- | :--- | :--- | :--- |
| **Left Hand Joints & Bones** | `#38BDF8` | `sky-400` | Identifies left hand when crossed over body |
| **Right Hand Joints & Bones** | `#34D399` | `emerald-400` | Identifies right hand when crossed over body |
| **Upper Body Pose Lines** | `#FFFFFF` | `white` | Connects shoulders, elbows, and wrists |
| **Facial Expression Mesh** | `#F59E0B` | `amber-400` | Highlights lip contours and raised/furrowed eyebrows |
| **Safe Framing Guide** | `rgba(148, 163, 184, 0.25)` | `slate-400/25` | Dashed bounding box for ideal torso/hand placement |
| **Out-of-Frame Alert Border**| `#F43F5E` | `rose-500` | Flashes when hands wander outside the 10% edge margin |

---

## 2. Layout & Component Specification

### 2.1 Workspace Header (`<Navbar />`)
- **Left**: App logo pill with glowing dot: `SignBridge ISL` + version tag `Phase 1: Vision Core`.
- **Center**: Status badge: `Holistic Landmarker (WebGL)` with indicator dot (Green = Active, Amber = Compiling Shaders / Caching, Red = Idle / Error).
- **Right**: Real-time Telemetry Pill: `[● 60 FPS | 12ms Worker]`.

### 2.2 Vision Stage (`<SignerStage />`)
- **Container**: Centered, rounded-2xl container (`max-w-4xl`) with `aspect-[4/3]` or fixed `640x480` canvas coordinate space.
- **Video Element**: Mirrored horizontally (`transform: scaleX(-1)`), object-cover, playsinline, muted.
- **Canvas Overlay**: Synchronized directly over video with exact pixel-matching dimensions (`width={640} height={480}`).
- **Interactive Controls**:
  - `[Toggle Camera]` button with camera icon (Lucide `Camera` / `CameraOff`).
  - `[Skeleton Visibility]` button (Lucide `Activity`).
  - Framing Guide safe-box toggle.

---

## 3. Interaction & Animation Contracts
- **Camera Permission Request**: Shows a sleek dark modal with camera illustration and permission prompt if camera is blocked or uninitiated.
- **Shader Warm-Up State**: During the initial 300ms worker boot, display a subtle pulsing skeleton skeleton shimmer ("Compiling WebGL Shaders...").
- **Boundary Detection**: When wrist landmarks enter the outer 10% perimeter of the canvas, the container outline transitions smoothly (`transition-colors duration-200`) to `border-rose-500/80` with a warning badge: `"Keep hands inside frame"`.
