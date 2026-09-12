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

1. Choose **Normal** (full scouting stats) or **Hard** (identity and season only).
2. Draft seven players into QB, RB1, RB2, WR1, WR2, TE and FLEX. FLEX accepts RB, WR or TE; cards show exactly where they will go.
3. Once per draft, optionally **redraw the board**. All three options are replaced and the new board may be worse. Redraw is unavailable in the MVP round.
4. The eighth pick is the **MVP Showcase**: an elite season at any position, worth a 10% bonus to its card value.
5. Get your team rating, compare it with your previous best, see your strongest season and improvement opportunity, then run it back.

Optional missions add a second reason to choose a card:

- **Time Machine:** seasons from three different decades.
- **Home Field:** three players from one NFL franchise.
- **Road Trip:** eight different NFL franchises.

Mission stamps are awarded only on completed drafts. They never add rating points. Historical Rams, Chargers and Raiders abbreviations count as their current franchise. Cards also indicate whether they are new to your vault; discoveries are saved on completion.

## Scoring

The underlying scoring and player dataset are preserved. Full PPR fantasy points use one point per reception. Each season's `normalizedValue` is a position-relative rank within this collection, on a 40–95 scale. The team rating uses the sum of seven values plus 1.1 times the MVP's value, mapped to 44–212:

```text
round(clamp(44 + (weighted sum - 400) / 280 * 168, 44, 212))
```

The results PPR total is the sum of individual historical season totals, not a simulated shared season. The dataset is static, not a live NFL feed. No player statistics were changed in this improvement pass.

## Collection and persistence

Completed drafts, separate Normal/Hard records, collection counts, and lifetime mission stamps are saved in browser local storage. The latest 25 rosters are retained; lifetime totals and stamps continue beyond that limit. Existing version-1 saves and card-ID migrations remain compatible. Vault search supports player, team abbreviation/name, and year, combined with position and collected/missing filters.

Progress is local to this browser and origin. An unfinished draft is not restored after a refresh. If storage is unavailable, play continues in memory. Reset Progression clears saved records and mission stamps after confirmation.

## Validation

```bash
npm test
npm run lint
npm run build
```

`npm test` uses Vite's existing tooling to run the checks in Node; no new test dependency is required. It validates all 350 cards against the existing PPR/normalization formula, runs 3,000 complete draft simulations, and checks redraw limits, honest theme labels, duplicate-player prevention, scoring, missions, relocated franchises, storage isolation, history limits, old-save compatibility, migration, corrupt saves, and unavailable storage.

Developer checks no longer run at application launch. In particular, simulated progression never writes to the player's browser storage. Only the actual completion handler persists a draft, outside React state updaters and guarded against duplicate completion.

## Structure

- `src/components/`: home, draft room, results, history, collection and appearance UI
- `src/data/`: curated cards, round themes and rating tiers
- `src/lib/`: draft/roster engine, scoring, missions, progression and themes
- `src/product.css`: broadcast-style presentation and responsive layouts using the existing theme tokens
- `tests/game.test.ts`: deterministic gameplay and persistence regression checks

## Remaining product considerations

The existing rating ceiling can produce ties at 212, particularly when optimizing visible card values. A future scoring revision should preserve or version old records and use a larger playtest sample before changing calibration. Theme selection also retains its original weighting toward larger eligible pools. Assets include unused placeholder player-image fields; the presentation intentionally uses season typography and verified jersey numbers rather than unreliable portraits.

A seeded daily draft with a shareable result is the strongest next feature: a shared challenge and a reason to return tomorrow without making an eight-pick game slower. Salary-cap scenarios, a richer 212-point endgame, draft resume, and curated era collections are deliberately outside this pass.
