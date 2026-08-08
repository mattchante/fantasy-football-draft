# Draft Cards — Fantasy Football

A single-page fantasy football draft card game. Build an 8-player roster across themed draft rounds, get a team rating, and draft again.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## How It Works

1. **Start Draft** from the home screen
2. Each round presents a themed category with **3 player cards**
3. Pick one card — it auto-assigns to your roster (QB, RB1, RB2, WR1, WR2, TE, FLEX)
4. After 7 normal picks, the **MVP Showcase** round lets you pick an elite wildcard
5. View your **team rating (44–212)** and full roster
6. Hit **Draft Again** for a fresh randomized experience

## Project Structure

```
src/
  components/     # React UI (HomeScreen, DraftScreen, PlayerCard, TeamReveal, …)
  data/           # Player cards, round themes, rating tiers
  lib/            # Game logic (draft engine, roster, validation, scoring, rating)
  types.ts        # Shared TypeScript types
```

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Static local data (no backend)
