// tests/core/services/daily_notes/parse/DailyNoteParser.timelog.test.ts
import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { initLang } from './_helpers';
import fs from 'fs';
import path from 'path';

const load = (name: string) =>
  fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

describe('DailyNoteParser timelog', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  test('午前/午後の複数タイムログ', () => {
    const raw = load('daily_timelog_multi.md');
    const note = DailyNoteParser.parse(raw);

    expect(note.taskTimelog.isPresent()).toBe(true);
    expect(note.taskTimelog.body).toContain('MEMO');

    expect(note.taskReviews.count()).toBe(2);
    expect(note.taskReviews.items[0].suffix).toContain('午前');
    expect(note.taskReviews.items[1].body).toContain('task C');
  });
});
