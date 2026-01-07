// tests/core/services/daily_notes/parse/DailyNoteParser.i18n.test.ts
import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { initLang } from './_helpers';

describe('DailyNoteParser i18n', () => {
  test('ja/en 見出し切替でも同一 key', async () => {
    await initLang('ja');
    let note = DailyNoteParser.parse('## 🙌 振り返りメモ');
    expect(note.reviewMemo.isPresent()).toBe(true);

    await initLang('en');
    note = DailyNoteParser.parse('## 🙌 Review Memo');
    expect(note.reviewMemo.isPresent()).toBe(true);
  });
});
