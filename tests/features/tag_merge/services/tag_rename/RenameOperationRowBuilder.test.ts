// tests/features/tag_merge/services/tag_rename/RenameOperationRowBuilder.test.ts

import { RenameOperationRowBuilder } from 'src/features/tag_merge/services/tag_rename/RenameOperationRowBuilder';
import { RenameCandidateRow } from 'src/features/tag_merge/services/tag_rename/models/RenameCandidateRow';

// --- DebugViewModal をモック（debug=false 前提だが安全のため） ---
jest.mock('src/features/tag_merge/ui/utils/DebugViewModal', () => ({
  DebugViewModal: jest.fn().mockImplementation(() => ({
    open: jest.fn(),
  })),
}));

// --- ダミー App ---
const dummyApp: any = {};

// --- ユーティリティ ---
const c = (from: string, to: string): RenameCandidateRow => ({
  from,
  to,
  priority: 'high',
});

describe('RenameOperationRowBuilder', () => {
  let builder: RenameOperationRowBuilder;

  beforeEach(() => {
    builder = new RenameOperationRowBuilder(dummyApp);
  });

  test('compresses simple chain A->B->C->D to A,B,C -> D', () => {
    const rows = builder.build([c('A', 'B'), c('B', 'C'), c('C', 'D')]);

    expect(rows).toEqual([
      { from: 'A', to: 'D' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'D' },
    ]);
  });

  test('keeps independent renames', () => {
    const rows = builder.build([c('A', 'B'), c('C', 'D')]);

    expect(rows).toEqual([
      { from: 'A', to: 'B' },
      { from: 'C', to: 'D' },
    ]);
  });

  test('removes simple cycle A->B->A', () => {
    const rows = builder.build([c('A', 'B'), c('B', 'A')]);

    expect(rows).toEqual([]);
  });

  test('removes partial cycle A->B->C->B', () => {
    const rows = builder.build([c('A', 'B'), c('B', 'C'), c('C', 'B')]);

    expect(rows).toEqual([]);
  });

  test('keeps only safe renames when mixed with cycle', () => {
    const rows = builder.build([
      c('A', 'B'),
      c('B', 'C'),
      c('C', 'B'), // cycle
      c('D', 'E'),
    ]);

    expect(rows).toEqual([{ from: 'D', to: 'E' }]);
  });

  test('skips invalid rows where from === to', () => {
    const rows = builder.build([c('A', 'A'), c('B', 'C')]);

    expect(rows).toEqual([{ from: 'B', to: 'C' }]);
  });

  test('last mapping wins for same from key', () => {
    const rows = builder.build([
      c('A', 'B'),
      c('A', 'C'), // last wins
      c('C', 'D'),
    ]);

    expect(rows).toEqual([
      { from: 'A', to: 'D' },
      { from: 'C', to: 'D' },
    ]);
  });
});
