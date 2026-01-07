// tests/core/services/daily_notes/parse/HeadingLabelResolver.test.ts

import { HeadingLabelResolver } from 'src/core/services/daily_notes/parse/HeadingLabelResolver';
import { initI18n } from 'src/i18n';

describe('HeadingLabelResolver', () => {
  test('ja label is resolved and normalized', async () => {
    await initI18n('ja');
    HeadingLabelResolver.rebuild();

    const label = HeadingLabelResolver.normalizedTitle('note.review.memo');

    expect(label).toBeDefined();
    // 絵文字・空白除去後の比較用キー
    expect(label).toContain('振り返りメモ');
  });

  test('en label is resolved after lang switch', async () => {
    await initI18n('en');
    HeadingLabelResolver.rebuild();

    const label = HeadingLabelResolver.normalizedTitle('note.review.memo');

    expect(label).toContain('ReviewMemo');
  });
});
