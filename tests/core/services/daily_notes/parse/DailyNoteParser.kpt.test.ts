// tests/core/services/daily_notes/parse/DailyNoteParser.kpt.test.ts
import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { initLang } from './_helpers';
import fs from 'fs';
import path from 'path';

const load = (name: string) =>
  fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

describe('DailyNoteParser KPT', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  test('KPT 複数（回数 suffix）', () => {
    const raw = load('daily_ja_kpt_multi.md');
    const note = DailyNoteParser.parse(raw);

    expect(note.kpts.count()).toBe(2);
    expect(note.kpts.items[0].suffix).toContain('1回目');
    expect(note.kpts.items[1].suffix).toContain('2回目');
    expect(note.kpts.items[0].body).toContain('Keep');
  });
});
