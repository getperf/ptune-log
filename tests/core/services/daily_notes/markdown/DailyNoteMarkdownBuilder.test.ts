// tests/core/services/daily_notes/markdown/DailyNoteMarkdownBuilder.test.ts

import fs from 'fs';
import { DailyNoteParser } from 'src/core/services/daily_notes/parse/DailyNoteParser';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { Section } from 'src/core/models/daily_notes/Section';
import { DailyNoteMarkdownBuilder } from 'src/core/services/daily_notes/markdown/DailyNoteMarkdownBuilder';
import { initLang } from '../parse/_helpers';

describe('DailyNoteParser basic', () => {
  beforeAll(async () => {
    await initLang('ja');
  });

  test('builds plannedTask only', () => {
    const note = DailyNote.fromParsed({
      raw: '',
      plannedTask: Section.fromBody('task.planned', '- [ ] Task A'),
      taskTimelog: Section.empty('task.timelog'),
      reviewMemo: Section.empty('note.review.memo'),
      reviewedNote: Section.empty('note.report'),
    });

    const md = DailyNoteMarkdownBuilder.build(note);
    expect(md).toContain('##');
    expect(md).toContain('- [ ] Task A');
  });

  test('parse -> build -> parse keeps structure', () => {
    const raw = fs.readFileSync(
      'tests/core/services/daily_notes/parse/fixtures/daily_mixed_sections.md',
      'utf-8'
    );

    const note1 = DailyNoteParser.parse(raw);
    const rebuilt = DailyNoteMarkdownBuilder.build(note1);
    const note2 = DailyNoteParser.parse(rebuilt);

    expect(note2.plannedTask.body).toBe(note1.plannedTask.body);

    expect(note2.taskReviews.items.length).toBe(note1.taskReviews.items.length);
  });
});
