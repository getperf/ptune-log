// tests/core/services/daily_notes/DailyNoteContentUpdater.test.ts
import { DailyNoteContentUpdater } from 'src/core/services/daily_notes/DailyNoteContentUpdater';
import { createDummySummaries } from '../../../helpers/DummyNoteSummaries';
import { DailyNoteFactory } from 'src/core/models/daily_notes/reviews/factories/DailyNoteFactory';
import { SectionParser } from 'src/core/services/daily_notes/SectionParser';
import { ja } from 'src/i18n/domain/daily_note/ja';
import { initI18n } from 'src/i18n';

beforeAll(() => {
  initI18n('ja');
});

const baseMarkdown = `
## ✅ 今日の予定タスク（手動で追記OK）
- 

## 🙌 振り返りメモ
- 

`.trim();

describe('DailyNoteContentUpdater', () => {
  const summaries = createDummySummaries();
  const parser = new SectionParser(ja);
  const factory = new DailyNoteFactory(parser);

  test('inserts daily report and tag list when missing', () => {
    const dailyNote = factory.fromMarkdown(baseMarkdown);

    const updated = DailyNoteContentUpdater.updateContent(
      baseMarkdown,
      summaries,
      dailyNote,
      '2026-01-03',
      { enableChecklist: true }
    );

    expect(updated).toContain('### 🏷 デイリーレポート（2026-01-03)');
    expect(updated).toContain('- [x] done A');
    expect(updated).toContain('### 📌 タグ一覧');
    expect(updated).toContain('#tag1 #tag2');
    expect(updated).toContain('#newtag');
  });

  test('does not duplicate existing blocks', () => {
    const withReport = `
## ✅ 今日の予定タスク（手動で追記OK）
- 

## 🙌 振り返りメモ

### 🏷 デイリーレポート（2026-01-03)
EXISTING
`.trim();

    const dailyNote = factory.fromMarkdown(withReport);

    const updated = DailyNoteContentUpdater.updateContent(
      withReport,
      summaries,
      dailyNote,
      '2026-01-03'
    );

    const count = updated.match(/デイリーレポート/g)?.length ?? 0;
    expect(count).toBe(2);
  });

  test('adds daily report when tag list exists but report is missing', () => {
    const markdown = `
## ✅ 今日の予定タスク（手動で追記OK）
- 

## 🙌 振り返りメモ

### 📌 タグ一覧
#tag1 #tag2
`.trim();

    const dailyNote = factory.fromMarkdown(markdown);

    const updated = DailyNoteContentUpdater.updateContent(
      markdown,
      summaries,
      dailyNote,
      '2026-01-03'
    );
    console.log(updated);
    expect(updated).toContain('### 🏷 デイリーレポート（2026-01-03)');
    expect(updated.match(/タグ一覧/g)?.length).toBe(1);
  });

  test('adds tag list when daily report exists but tag list is missing', () => {
    const markdown = `
## ✅ 今日の予定タスク（手動で追記OK）
- 

## 🙌 振り返りメモ

### 🏷 デイリーレポート（2026-01-03)
EXISTING
`.trim();

    const dailyNote = factory.fromMarkdown(markdown);

    const updated = DailyNoteContentUpdater.updateContent(
      markdown,
      summaries,
      dailyNote,
      '2026-01-03'
    );

    expect(updated).toContain('### 📌 タグ一覧');
    expect(updated.match(/デイリーレポート/g)?.length).toBe(1);
  });

  test('does not include checklist instruction when enableChecklist is false', () => {
    const dailyNote = factory.fromMarkdown(baseMarkdown);

    const updated = DailyNoteContentUpdater.updateContent(
      baseMarkdown,
      summaries,
      dailyNote,
      '2026-01-03',
      { enableChecklist: false }
    );

    expect(updated).not.toContain('チェックし');
    expect(updated).not.toContain('- [ ]');
  });

  test('is idempotent when executed twice', () => {
    const dailyNote1 = factory.fromMarkdown(baseMarkdown);

    const once = DailyNoteContentUpdater.updateContent(
      baseMarkdown,
      summaries,
      dailyNote1,
      '2026-01-03'
    );

    const dailyNote2 = factory.fromMarkdown(once);

    const twice = DailyNoteContentUpdater.updateContent(
      once,
      summaries,
      dailyNote2,
      '2026-01-03'
    );

    expect(twice).toBe(once);
  });
});
