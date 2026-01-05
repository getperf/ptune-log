// tests/core/services/daily_notes/DailyNoteContentUpdater.test.ts

import { DailyNoteContentUpdater } from 'src/core/services/daily_notes/DailyNoteContentUpdater';
import type { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

describe('DailyNoteContentUpdater.updateContent', () => {
  const baseContent = `
## 🙌 振り返りメモ
-
`;

  const summariesStub = {
    summaryMarkdown: () => `
#### _project/001_sample
- [ ] サマリ1
- [x] サマリ2

###### ユーザレビュー
- コメント
`,
    getAllTags: () => ['主題/ツール/i18n', '用途/プロジェクト/ptune-log'],
    getAllUnregisteredTags: () => ['主題/ツール/i18n'],
  } as unknown as NoteSummaries;

  test('デイリーレポートとタグ一覧を初回のみ挿入する', () => {
    const updated = DailyNoteContentUpdater.updateContent(
      baseContent,
      summariesStub,
      '2026-01-03',
      { enableChecklist: true }
    );

    expect(updated).toContain('### 🏷 デイリーレポート（2026-01-03)');
    expect(updated).toContain('### 📌 タグ一覧（当日生成）');
    expect(updated).toContain('### ⚠ 未登録タグ候補（要レビュー）');
  });

  test('既存レポートがある場合は重複挿入しない', () => {
    const once = DailyNoteContentUpdater.updateContent(
      baseContent,
      summariesStub,
      '2026-01-03',
      {}
    );

    const twice = DailyNoteContentUpdater.updateContent(
      once,
      summariesStub,
      '2026-01-03',
      {}
    );

    const count = twice.match(/### 🏷 デイリーレポート/g)?.length ?? 0;
    expect(count).toBe(1);
  });

  test('振り返りメモ直下に挿入される', () => {
    const updated = DailyNoteContentUpdater.updateContent(
      baseContent,
      summariesStub,
      '2026-01-03',
      {}
    );

    const idxHeader = updated.indexOf('## 🙌 振り返りメモ');
    const idxReport = updated.indexOf('### 🏷 デイリーレポート');

    expect(idxReport).toBeGreaterThan(idxHeader);
  });
});
