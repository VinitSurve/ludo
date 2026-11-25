# 🎲 Ludo Master — Royal Casual Board Game

A complete, production-quality, responsive single-page Ludo board game built with **React**, **Vite**, and **JavaScript**, supporting **2 to 6 local players** across two distinct mathematical board variants (**Classic 15×15** and **Extended 6-Sector Hexagonal**).

---

## ✨ Features & Highlights

### 🎮 Player Modes (2 to 6 Players)
- **2–4 Players (Classic Mode):** Traditional 15×15 Ludo grid with 52 track cells, 4 colored home bases (Red, Green, Yellow, Blue), safe squares, colored home lanes, and center finish.
- **5–6 Players (Extended Mode):** Symmetrical 6-sector hexagonal board with 66 track cells, 6 home bases (Red, Blue, Green, Yellow, Purple, Orange), 6 dedicated entry paths, home lanes, and central finish.
- **Player Customization:** Configure custom player names, select from 12 avatars (🦁, 🐺, 🐲, 🦅, 🦄, 🐯, etc.), and view dynamic player cards.

### ♟️ Realistic 3D Ludo Pawns
- **Physical Board-Game Pawn Silhouette:** Beautifully shaped pawns featuring a spherical head with specular gloss reflection, narrow collar neck, flared bell body, stepped circular pedestal base, and realistic soft contact drop shadow.
- **6 Vibrant Color Variants:** Custom gradients for Red, Blue, Green, Yellow, Purple, and Orange pawns.
- **Dynamic Interactive States:**
  - *Normal:* Sits centered in board cell with grounding contact shadow.
  - *Selectable:* Soft glowing aura (`drop-shadow`) and smooth bounce hop animation (`@keyframes pawnHopBounce`) with pointer cursor.
  - *Finished:* Radiant golden finish glow with celebration effects.
  - *Stacking Badge:* High-contrast count badge when multiple pawns share a safe square.

### ⚡ Intelligent Automatic Move Selection
- **Single Legal Move Automation:** If exactly one pawn can legally move after a roll, the game engine automatically moves it without requiring unnecessary clicks or confirmation prompts.
- **Base Pawn Management on Rolling 6:**
  - If no pawns are on the board, rolling a 6 automatically brings the next available base pawn onto the track without asking the user to choose among 4 visually identical pieces.
  - If exactly one board pawn can legally move, it prioritizes moving that existing pawn automatically.
  - If multiple board pawns can legally move, all legal choices are highlighted, allowing the player to make a meaningful decision.
- **Zero-Move Auto-Pass:** If no legal moves exist, the game displays "No legal moves" and automatically passes the turn after a short delay.
- **Race Condition Prevention:** The dice and controls are locked during roll animations and automatic moves, guaranteeing deterministic and glitch-free turn progression.
- **Captures & Safe Squares:**
  - Opponents are captured on regular track squares and sent back to base.
  - Safe squares (starting cells & star cells marked with ★) prevent captures; multiple pieces can safely share them.
- **Home Lane & Exact Finish:** Pieces must enter their colored home lane; an exact roll is required to finish.
- **Turn Manager & Bonus Turns:**
  - Automatic circular turn rotation.
  - Bonus turns awarded for rolling a 6, capturing an opponent piece, or finishing a piece.
  - Automatic turn pass when rolling with no legal moves available.
- **Winning Celebrations:** Triumphant victory modal with multi-angle confetti animations (`canvas-confetti`) and rematch options.

### 📊 Scoreboard, Manual Adjustments & Undo
- **Scoreboard:** Real-time piece tracker (In Base, On Board, Finished $X/4$).
- **Manual Score Adjustments:** Immediate `+1`, `-1`, and `Reset` controls per player (never negative).
- **Global Score Reset:** Reset all players' scores with confirmation protection.
- **Full Snapshot Undo:** Instant undo restores board state, pieces, turn, dice, and event log without losing consistency.

### 🔊 High-Fidelity Synthesized Audio (Web Audio API)
- Zero external audio assets! Runs 100% offline.
- Synthesizes realistic 3D dice rattles, piece hop pops, capture booms, safe square chimes, finish arpeggios, and victory fanfare.
- Persistent sound toggle (persisted in `localStorage`).

### 🛠️ Developer & QA Tools
- **3D Animated Dice:** Realistic 3D cube with rolling animations.
- **Dev Dice Simulator:** Built-in override panel to force specific dice values (1–6) for rapid test inspection.

---

## 🏗️ Architecture & Project Structure

The project strictly separates the pure game engine and mathematical board definitions from the React UI components:

```text
Mini Project - Ludo/
├── public/
│   └── dice.svg                  # Favicon & vector assets
│
├── src/
│   ├── components/               # Pure presentation & UI components
│   │   ├── BoardCell.jsx         # 15x15 classic cell with safe stars & start arrows
│   │   ├── ConfirmModal.jsx      # Confirmation dialog for score resets
│   │   ├── Dice.jsx              # 3D animated dice with Dev Simulator
│   │   ├── GameBoard.jsx         # Dual-mode board (Classic 15x15 & Extended SVG)
│   │   ├── GameControls.jsx      # Undo, Reset All Scores, Rules buttons
│   │   ├── GameStatus.jsx        # Dynamic turn, roll, and event guidance banner
│   │   ├── Header.jsx            # Top navbar, badges, sound toggle, new game
│   │   ├── Piece.jsx             # 3D token piece with crown and stack count
│   │   ├── PlayerCard.jsx        # Player status, piece counters, and score controls
│   │   ├── PlayerSetupModal.jsx  # New game modal (2-6 player count & names)
│   │   ├── RecentMoves.jsx       # Event history log
│   │   ├── RulesModal.jsx        # Comprehensive visual rule guide
│   │   ├── SettingsModal.jsx     # Rule and audio settings
│   │   └── WinnerModal.jsx       # Victory celebration and rematch modal
│   │
│   ├── game/                     # Headless Game Engine
│   │   ├── constants.js          # Player colors, cell types, default rules
│   │   ├── boardLayouts.js       # Mathematical 15x15 grid & 6-sector hexagonal geometry
│   │   ├── movement.js           # Legal move calculations, path tracking, overshoot checks
│   │   ├── captures.js           # Capture logic and safe square validation
│   │   ├── turnManager.js        # Turn rotations, bonus rolls, winning detection
│   │   ├── gameReducer.js        # Predictable state reducer with snapshot undo stack
│   │   ├── gameUtils.js          # Piece initialization and state factory
│   │   └── gameEngine.js         # Unified engine exports
│   │
│   ├── hooks/
│   │   ├── useGame.js            # Game state hook with timer auto-pass
│   │   ├── useSound.js           # Web Audio API sound synthesizer
│   │   └── useLocalStorage.js    # Safe persistent storage hook
│   │
│   ├── styles/
│   │   ├── global.css            # Color variables, typography, shadows
│   │   ├── board.css             # 15x15 CSS Grid, pieces, hexagonal SVG styles
│   │   ├── components.css        # 3D dice, modals, cards, badges
│   │   └── responsive.css        # Desktop 3-column, tablet, and mobile layouts
│   │
│   ├── App.jsx                   # Main layout and coordinator
│   ├── main.jsx                  # React 19 entry point
│   └── setupTests.js             # Vitest setup
│
├── tests/                        # Vitest automated test suite
│   ├── board.test.js             # Board dimensions, connectivity, path validation
│   ├── movement.test.js          # Base exit on 6, step movement, exact finish
│   ├── captures.test.js          # Captures on track, safe square immunity
│   ├── turns.test.js             # Turn rotation, bonus rolls on 6/capture/finish
│   ├── winning.test.js           # 4-piece finish condition and game over
│   └── scoreboard.test.js        # Manual +/- score adjustments and full undo
│
├── index.html                    # Responsive viewport and font preconnects
├── vite.config.js                # Vite build and test configuration
└── package.json                  # Dependencies and scripts
```

---

## 🎨 Color Palette

| Player | Color | Hex Code | Border | Background Tint |
|---|---|---|---|---|
| **Player 1** | Red | `#EF4444` | `#DC2626` | `#FEE2E2` |
| **Player 2** | Blue | `#3B82F6` | `#2563EB` | `#DBEAFE` |
| **Player 3** | Green | `#22C55E` | `#16A34A` | `#DCFCE7` |
| **Player 4** | Yellow | `#FACC15` | `#CA8A04` | `#FEF9C3` |
| **Player 5** | Purple | `#A855F7` | `#9333EA` | `#F3E8FF` |
| **Player 6** | Orange | `#F97316` | `#EA580C` | `#FFEDD5` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24.21.0)
- **npm**: v9.0.0 or higher

### Installation

1. Navigate to the project directory:
   ```bash
   cd "Mini Project - Ludo"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Development Server

Start the local Vite development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173/`.

### Running Automated Tests

Run the full Vitest suite (47 tests):
```bash
npm run test
```

### Building for Production

Compile optimized production assets:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## 🧪 Automated Test Results

The project includes 47 comprehensive Vitest unit and integration tests covering all engine logic, pawn components, and UX scenarios:

| Test Suite | Tests | Result | Coverage |
|---|---|---|---|
| `tests/automove.test.js` | 8 passed | ✅ Passed | All 8 prompt scenarios: single move, multiple choices, roll 6 with base pawns, capture/finish auto-moves |
| `tests/pawn.test.jsx` | 5 passed | ✅ Passed | 3D pawn SVG rendering (head, neck, body, base, shadow), legal pulse, click handlers, stacking |
| `tests/app.integration.test.jsx` | 5 passed | ✅ Passed | Full App rendering, modal switching (4P to 6P), score adjustments, dev roll auto-moves |
| `tests/board.test.js` | 5 passed | ✅ Passed | 15×15 dimensions, 52 cells, safe stars, 6-sector geometry |
| `tests/movement.test.js` | 7 passed | ✅ Passed | Base exit on 6, step advancement, overshoot prevention |
| `tests/captures.test.js` | 4 passed | ✅ Passed | Track capture, safe square immunity, own-piece safety |
| `tests/turns.test.js` | 7 passed | ✅ Passed | Circular rotation, 6 roll bonus, capture bonus, auto-pass |
| `tests/winning.test.js` | 2 passed | ✅ Passed | 4-piece finish detection, GAME_OVER transition |
| `tests/scoreboard.test.js` | 4 passed | ✅ Passed | Score +/- controls, clamp at 0, snapshot undo |
| **Total** | **47 passed** | **✅ 100% Pass** | |

---

## 📖 Game Rules Summary

1. **Starting:** 4 pieces per player start in their home base. Rolling a **6** moves a piece to the start square.
2. **Movement:** Pieces advance clockwise along the main track by the number on the dice.
3. **Safe Squares:** Starting squares and Star squares (★) protect pieces from being captured.
4. **Captures:** Landing on an opponent piece on a non-safe square captures it, sending it back to base and granting an extra turn.
5. **Bonus Turns:** Awarded for rolling a **6**, capturing an opponent, or finishing a piece.
6. **Home Lane & Finish:** After a full loop, pieces enter their colored home lane. An exact dice roll is required to land in the center finish.
7. **Winning:** The first player to bring all 4 pieces into the center finish wins!

---

## 📱 Responsive Design

- **Desktop (≥ 1100px):** Balanced 3-column layout (Scoreboard on left, Board centered, Dice & Log on right).
- **Tablet (768px – 1100px):** 2-column adaptive layout with scoreboard grid.
- **Mobile (≤ 768px):** Stacked vertical layout, full-width touch-friendly board scaling, compact player cards, accessible dice controls, and zero horizontal overflow.
