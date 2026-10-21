# Draft Cards — Fantasy Football

Build an eight-player fantasy roster from 350 curated NFL seasons. Three cards per themed round, one MVP finale, and a fresh board every draft. React + TypeScript + Vite; no account or backend required.

## Run locally

```bash
npm ci
npm run dev
```

For the production version:

```bash
npm run build
npm run preview
```

## The game

1. Choose **Normal** (box-score stats only) or **Hard** (identity and season only). Card values and fantasy points stay hidden until the draft ends.
2. Draft seven players into QB, RB1, RB2, WR1, WR2, TE and FLEX. FLEX accepts RB, WR or TE; cards show exactly where they will go.
3. Once per draft, optionally **redraw the board**. All three options are replaced and the new board may be worse. Redraw is unavailable in the MVP round.
4. The eighth pick is the **MVP Showcase**: an elite season at any position, worth a 10% bonus to its card value.
5. Get your **Draft Grade**, review every pick against the best card on its board, share the result, then run it back.

Completed drafts unlock **achievements**, collected in the **Collection Book** (20 in all, rated Common, Rare or Legendary):

- **Board Reading:** Eagle Eye, MVP Instinct, Clean Sheet, Comeback Kid, Front Office, War Room Genius, Perfect Board.
- **Football Knowledge:** Old School, Sleeper Hit, Rookie Scout, History Buff.
- **Hard Mode:** Film Room, Blindfolded, No Peeking.
- **Milestones:** Rookie GM, Seasoned GM, Franchise Icon (drafts played); Collector, Archivist, Completionist (vault seasons).

Achievements are checked only when a draft is completed and nothing is shown during the draft, so they never hint at which card is best. Repeatable achievements count every time they are earned (×N); milestones unlock once. Rarity tiers were set by simulating random and skilled players. Achievements never change your grade. Cards also indicate whether they are new to your vault; discoveries are saved on completion.

## Scoring

The underlying player dataset is preserved. Full PPR fantasy points use one point per reception. Each season's `normalizedValue` is a position-relative rank within this collection, on a 40–95 scale.

**Draft Grade** is the headline score. On every board, the best card earns full credit and the weakest earns none; accuracy is the share of available value captured across all eight boards, with the MVP board weighted 1.1×:

```text
accuracy = round(100 * Σ w * (pick - boardMin) / Σ w * (boardMax - boardMin))
```

Accuracy maps to grades from F to A+ (`src/data/draftGrades.ts`). The thresholds are calibrated by simulation: random picks average about 51% (C-), a box-score formula about 77% (B), formula plus flavor tags about 84% (B+). Reaching an A takes real football knowledge. Each pick is marked best on board (🟩), close (🟨, within 10 value points) or missed (🟥), which is also the share format.

**Team strength** is the uncapped sum of the eight card values, MVP ×1.1, with tier labels from Disaster to Broken. The results PPR total is the sum of individual historical season totals, not a simulated shared season. The dataset is static, not a live NFL feed.

## Player photos

Cards show a headshot of the player behind their name: 226 of 234 players, linked from NFL.com's image CDN or, where NFL only has a placeholder, ESPN's. Images are hotlinked at card size and are not stored in this repo; they belong to their owners, and the game is a personal, non-commercial project. A player keeps one photo across all of their cards, so the uniform may not match the card's season. Players with no real photo, and any image that fails to load, show the jersey-number art instead.

`python3 scripts/enrich_headshots.py` rebuilds the links from the cached nflverse rosters, checks every NFL photo against NFL's placeholder helmet, and writes `scripts/headshot-enrichment-report.json`.

## Collection and persistence

Completed drafts, separate Normal/Hard best grades, collection counts, and achievement unlocks with lifetime counts are saved in browser local storage. The latest 25 rosters are retained; lifetime totals and achievement counts continue beyond that limit. Stamps from the retired side missions stay in saved data but are no longer shown. Existing version-1 saves and card-ID migrations remain compatible. Vault search supports player, team abbreviation/name, and year, combined with position and collected/missing filters.

Progress is local to this browser and origin. An unfinished draft is not restored after a refresh. If storage is unavailable, play continues in memory. Reset Progression clears saved records and achievements after confirmation.

## Validation

```bash
npm test
npm run lint
npm run build
```

`npm test` uses Vite's existing tooling to run the checks in Node; no new test dependency is required. It validates all 350 cards against the existing PPR/normalization formula, runs 3,000 complete draft simulations, and checks redraw limits, honest theme labels, duplicate-player prevention, scoring, draft grades, achievements, storage isolation, history limits, old-save compatibility, migration, corrupt saves, and unavailable storage.

Developer checks no longer run at application launch. In particular, simulated progression never writes to the player's browser storage. Only the actual completion handler persists a draft, outside React state updaters and guarded against duplicate completion.

## Structure

- `src/components/`: home, draft room, results, history, collection and appearance UI
- `src/data/`: curated cards, round themes and rating tiers
- `src/lib/`: draft/roster engine, scoring, grades, achievements, progression and themes
- `src/product.css`: broadcast-style presentation and responsive layouts using the existing theme tokens
- `tests/game.test.ts`: deterministic gameplay and persistence regression checks

## Remaining product considerations

The existing rating ceiling can produce ties at 212, particularly when optimizing visible card values. A future scoring revision should preserve or version old records and use a larger playtest sample before changing calibration. Theme selection also retains its original weighting toward larger eligible pools. Assets include unused placeholder player-image fields; the presentation intentionally uses season typography and verified jersey numbers rather than unreliable portraits.

A seeded daily draft with a shareable result is the strongest next feature: a shared challenge and a reason to return tomorrow without making an eight-pick game slower. Salary-cap scenarios, a richer 212-point endgame, draft resume, and curated era collections are deliberately outside this pass.
