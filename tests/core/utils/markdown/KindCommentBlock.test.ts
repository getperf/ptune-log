// tests/core/utils/markdown/KindCommentBlock.test.ts

import { KindCommentBlock } from 'src/core/utils/markdown/KindCommentBlock';

describe('KindCommentBlock.removeAll', () => {
  it('複数の kind コメントブロックをすべて除去できること', () => {
    const input = `
# デイリーノート

<!-- kind:daily-review-comment -->
LLM が生成したレビュー要約です。
<!-- /kind -->

本文A

<!-- kind:kpt-internal-note -->
内部向けの注記。
複数行テキスト。
<!-- /kind -->

本文B

<!-- kind:another-kind -->
別種のコメント。
<!-- /kind -->

本文C
`.trim();

    const result = KindCommentBlock.removeAll(input);

    expect(result).toBe(
      `
# デイリーノート

本文A

本文B

本文C
`.trim()
    );
  });

  it('kind コメントが存在しない場合は原文を保持すること', () => {
    const input = `
# デイリーノート

本文のみです。
`.trim();

    const result = KindCommentBlock.removeAll(input);

    expect(result).toBe(input);
  });

  it('kind コメントのみの場合は空文字になること', () => {
    const input = `
<!-- kind:only -->
コメントのみ
<!-- /kind -->
`.trim();

    const result = KindCommentBlock.removeAll(input);

    expect(result).toBe('');
  });
});
