// tests/features/note_analysis/extractors/DailyReportReviewExtractor.test.ts

import { DailyReportReviewExtractor } from 'src/features/note_analysis/services/extractors/DailyReportReviewExtractor';

describe('DailyReportReviewExtractor (ordered lines)', () => {
  it('入力順を保持して ReviewLine を抽出できる', () => {
    const markdown = `
##### [[noteA|ノートA]]
- [x] 実装完了
- [ ] テスト未実施

###### レビューコメント
- 仕様は問題なし
- テスト追加が必要
`.trim();

    const extractor = new DailyReportReviewExtractor();
    const result = extractor.extract(markdown);

    expect(result).toHaveLength(1);

    const note = result[0];
    expect(note.path).toBe('noteA');
    expect(note.title).toBe('ノートA');

    expect(note.lines).toEqual([
      { type: 'CHECKED', text: '実装完了' },
      { type: 'UNCHECKED', text: 'テスト未実施' },
      { type: 'USERCOMMENT', text: '仕様は問題なし' },
      { type: 'USERCOMMENT', text: 'テスト追加が必要' },
    ]);
  });

  it('複数ノートを順に抽出できる', () => {
    const markdown = `
##### noteA
- [x] A1

##### [[noteB|Bノート]]
- [ ] B1
`.trim();

    const extractor = new DailyReportReviewExtractor();
    const result = extractor.extract(markdown);

    expect(result).toHaveLength(2);

    expect(result[0].title).toBe('noteA');
    expect(result[0].lines[0]).toEqual({ type: 'CHECKED', text: 'A1' });

    expect(result[1].path).toBe('noteB');
    expect(result[1].title).toBe('Bノート');
    expect(result[1].lines[0]).toEqual({ type: 'UNCHECKED', text: 'B1' });
  });

  it('lines が空のノートは結果に含まれない', () => {
    const markdown = `
##### 空ノート
`.trim();

    const extractor = new DailyReportReviewExtractor();
    const result = extractor.extract(markdown);

    expect(result).toEqual([]);
  });
});
