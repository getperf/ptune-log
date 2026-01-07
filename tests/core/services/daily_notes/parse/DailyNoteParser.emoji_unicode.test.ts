// tests/core/services/daily_notes/parse/DailyNoteParser.emoji_unicode.test.ts
import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { initLang } from './_helpers';

describe('emoji / unicode normalize', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  test('emoji/VS/全角半角を無視して解決', () => {
    const raw = '## 🙌\uFE0F  振り返り\u3000メモ';
    const note = DailyNoteParser.parse(raw);

    expect(note.reviewMemo.isPresent()).toBe(true);
  });
});
