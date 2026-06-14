# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000 (opens browser automatically)
npm run build     # build to ./build/
```

There is no test suite or linter configured.

## Deployment

```bash
vercel --prod --yes          # deploy to Vercel (output dir: build/)
VITE_GITHUB_PAGES_BASE=/repo-name npm run build  # build for GitHub Pages
```

Custom slash commands in `.claude/commands/`: `/deploy_vercel`, `/deploy_github_page`.

## Architecture

Single-page React app built with Vite + TypeScript. All game logic lives in `src/App.tsx` — there are no routes or additional pages.

**Game flow:** `App.tsx` holds the entire state (`boxes`, `score`, `gameEnded`, `user`, `cumulativeScore`). On mount, `initializeGame()` randomly places a treasure in one of three `Box` objects. Clicking a chest calls `openBox()`, which updates score (+150 for treasure, -50 for skeleton) and sets `gameEnded` when the treasure is found or all boxes are opened. Win/Tie/Loss is determined by `score > 50` / `score < 50`.

**User system:** Optional login via name + email (no password). User records are persisted in `localStorage` under key `treasure_game_data`, keyed by email, storing `{ name, cumulativeScore }`. The `scoreRecorded` flag prevents double-writing when the game ends. Guests can play without logging in.

**Assets:**
- `src/assets/` — chest images (closed, treasure, skeleton) and `key.png` (used as custom cursor on hover)
- `src/audios/` — sound effects (`chest_open.mp3`, `chest_open_with_evil_laugh.mp3`)
- `src/results/` — additional UI assets

**UI components:** `src/components/ui/` contains a full shadcn/ui component library (Radix UI primitives + Tailwind). Only `Button` is currently used by the game. `src/components/figma/ImageWithFallback.tsx` provides a fallback image component. The `@` alias resolves to `src/`.

**Styling:** Tailwind CSS via `src/index.css` and `src/styles/globals.css`. Animations use `motion/react` (Motion library).

**Vite config:** versioned package aliases strip version suffixes from imports; build output goes to `build/` (not the default `dist/`).
