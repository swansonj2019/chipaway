# Chip Away

> Consistency over intensity. Chip away at your goals every day.

## Getting started locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Deploy to Vercel (get it on your iPhone)

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel
```
Follow the prompts. Done. You'll get a URL like `chipaway.vercel.app`.

### Option B — GitHub + Vercel dashboard
1. Push this folder to a new GitHub repo
2. Go to vercel.com → New Project → Import your repo
3. Leave all settings as default — Vercel auto-detects Vite
4. Hit Deploy

### Add to iPhone home screen
1. Open your Vercel URL in Safari on your iPhone
2. Tap the Share button (box with arrow)
3. Scroll down → "Add to Home Screen"
4. Tap Add

It will appear as a full-screen app with no browser chrome. That's the PWA magic.

## Stack
- React 18 + Vite
- IndexedDB (via native browser API) for local persistence
- Zero backend, zero dependencies beyond React
- PWA-ready (manifest + meta tags for iOS)

## Project structure
```
src/
  App.jsx           — root component, state, nav
  TodayView.jsx     — daily goal cards + log
  StatsView.jsx     — cumulative stats + charts
  GoalsView.jsx     — manage goals
  GoalCreationFlow.jsx — 4-step new goal wizard
  LogSheet.jsx      — bottom sheet numpad for logging
  db.js             — IndexedDB wrapper + seed data
  utils.js          — stats calculations
  styles.css        — all styles
```

## Notes
- Data lives in your browser's IndexedDB. Don't clear site data or it's gone.
- Demo data (pushups + piano goals with 30 days of history) seeds on first load.
- To start fresh: open DevTools → Application → IndexedDB → delete "chipaway" database, then reload.
