// tests/core/services/daily_notes/parse/DailyNoteParser.basic.test.ts

import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { initLang } from './_helpers';
import fs from 'fs';
import path from 'path';

const load = (name: string) =>
  fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');

describe('DailyNoteParser basic', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  test('初回（主要セクションなし）', () => {
    const raw = '# 2026-01-01\n雑記のみ';
    const note = DailyNoteParser.parse(raw);

    expect(note.reviewMemo.isPresent()).toBe(false);
    expect(note.reviewedNote.isPresent()).toBe(false);
    expect(note.kpts.count()).toBe(0);
    expect(note.taskReviews.count()).toBe(0);
  });

  test('振り返りメモのみ', () => {
    const raw = load('daily_ja_basic.md');
    const note = DailyNoteParser.parse(raw);

    expect(note.reviewMemo.isPresent()).toBe(true);
    expect(note.reviewMemo.body).toContain('NOTE_REVIEW_MEMO');
    expect(note.kpts.count()).toBe(0);
  });
});
