// tests/features/note_analysis/builders/KptReviewMarkdownBuilder.test.ts

import { KptReviewMarkdownBuilder } from 'src/features/note_analysis/services/builders/KptReviewMarkdownBuilder';
import { ReviewedNote } from 'src/core/models/daily_notes/ReviewedNote';

describe('KptReviewMarkdownBuilder (ordered output)', () => {
  it('ReviewLine の順序を保持して Markdown を生成できる', () => {
    const notes = [
      new ReviewedNote('プロジェクト/ノートA', 'ノートA', [
        { type: 'REJECTED', text: '実装完了' },
        { type: 'ACCEPTED', text: 'テスト未実施' },
        { type: 'USERCOMMENT', text: '仕様は問題なし' },
      ]),
    ];

    const result = KptReviewMarkdownBuilder.build(notes);

    expect(result).toBe(
      `
### プロジェクト/ノートA
- REJECTED: 実装完了
- ACCEPTED: テスト未実施
- USERCOMMENT: 仕様は問題なし
`.trim()
    );
  });

  it('複数ノートを順に連結できる', () => {
    const notes = [
      new ReviewedNote('A', 'a', [{ type: 'REJECTED', text: 'A1' }]),
      new ReviewedNote('B', 'b', [{ type: 'USERCOMMENT', text: 'B comment' }]),
    ];

    const result = KptReviewMarkdownBuilder.build(notes);

    expect(result).toBe(
      `
### A
- REJECTED: A1

### B
- USERCOMMENT: B comment
`.trim()
    );
  });
});
