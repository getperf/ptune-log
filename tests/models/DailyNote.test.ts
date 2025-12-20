import { DailyNote } from 'src/core/models/daily_notes/DailyNote';

describe('DailyNote', () => {
  it('hasKpt returns whether KPT entries exist', () => {
    const withKpt = new DailyNote(undefined, [], undefined, ['Keep: test']);
    const withoutKpt = new DailyNote(undefined, [], undefined, []);

    expect(withKpt.hasKpt()).toBe(true);
    expect(withoutKpt.hasKpt()).toBe(false);
  });

  it('latestKpt returns the last entry or undefined', () => {
    const note = new DailyNote(undefined, [], undefined, [
      'Keep',
      'Problem',
      'Try',
    ]);
    expect(note.latestKpt()).toBe('Try');

    const empty = new DailyNote(undefined, [], undefined, []);
    expect(empty.latestKpt()).toBeUndefined();
  });

  it('buildKptSourceText includes daily report and KPT sections with separators', () => {
    const note = new DailyNote(
      undefined,
      [],
      '  成果をまとめたレポートです  ',
      ['Keep: 効率的に進めた', 'Problem: 時間配分', 'Try: 前日に準備']
    );

    expect(note.buildKptSourceText()).toBe(
      '【当日のサマリ】\n成果をまとめたレポートです\n\n【既存のKPT分析】\nKeep: 効率的に進めた\n\n---\n\nProblem: 時間配分\n\n---\n\nTry: 前日に準備'
    );
  });

  it('buildKptSourceText omits summary when daily report is missing', () => {
    const note = new DailyNote(undefined, [], undefined, ['Keep only']);
    expect(note.buildKptSourceText()).toBe('【既存のKPT分析】\nKeep only');
  });

  it('buildKptSourceText returns empty string when no content exists', () => {
    const note = new DailyNote(undefined, [], undefined, []);
    expect(note.buildKptSourceText()).toBe('');
  });
});
