import { migrateProgression } from '../progression/migrateProgression';
import { createEmptyProgression } from '../progression/storage';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`validateProgressionMigration: ${message}`);
  }
}

export function validateProgressionMigration(): void {
  const progression = createEmptyProgression();
  progression.cardDraftCounts['jamaar-chase-2024'] = 3;
  progression.cardDraftCounts['jamarr-chase-2024'] = 2;
  progression.history = [
    {
      id: 'test-entry',
      completedAt: new Date().toISOString(),
      mode: 'normal',
      rating: 150,
      tierLabel: 'Strong',
      tierColor: '#fff',
      roster: [
        {
          slot: 'WR1',
          cardId: 'jamaar-chase-2024',
          name: "Ja'Marr Chase",
          position: 'WR',
          team: 'CIN',
          season: 2024,
        },
        { slot: 'QB', cardId: 'qb-1', name: 'QB', position: 'QB', team: 'X', season: 2024 },
        { slot: 'RB1', cardId: 'rb-1', name: 'RB', position: 'RB', team: 'X', season: 2024 },
        { slot: 'RB2', cardId: 'rb-2', name: 'RB2', position: 'RB', team: 'X', season: 2024 },
        { slot: 'WR2', cardId: 'wr-2', name: 'WR2', position: 'WR', team: 'X', season: 2024 },
        { slot: 'TE', cardId: 'te-1', name: 'TE', position: 'TE', team: 'X', season: 2024 },
        { slot: 'FLEX', cardId: 'flex-1', name: 'Flex', position: 'RB', team: 'X', season: 2024 },
        { slot: 'MVP', cardId: 'mvp-1', name: 'MVP', position: 'QB', team: 'X', season: 2024 },
      ],
    },
  ];

  const migratedOnce = migrateProgression(progression);
  assert(migratedOnce.cardDraftCounts['jamarr-chase-2024'] === 5, 'counts should merge alias into canonical');
  assert(migratedOnce.cardDraftCounts['jamaar-chase-2024'] === undefined, 'alias count key should be removed');
  assert(
    migratedOnce.history[0]?.roster[0]?.cardId === 'jamarr-chase-2024',
    'history cardId should rewrite to canonical',
  );

  const migratedTwice = migrateProgression(migratedOnce);
  assert(
    migratedTwice.cardDraftCounts['jamarr-chase-2024'] === 5,
    'second migration should be idempotent',
  );

  console.log('validateProgressionMigration: all checks passed');
}
