import { DailyReport } from 'src/core/models/daily_notes/reviews/DailyReport';
import { Section } from 'src/core/models/daily_notes/reviews/Section';
import { ReviewedNote } from 'src/core/models/daily_notes/reviews/ReviewedNote';

describe('DailyReport', () => {
  test('is empty when reviewed notes are empty', () => {
    const section = new Section<ReviewedNote[]>(
      'note.report',
      'Daily Report',
      ''
    );
    const report = new DailyReport(section);

    expect(report.isEmpty()).toBe(true);
  });

  test('outputs markdown when at least one ReviewedNote is not empty', () => {
    const section = new Section<ReviewedNote[]>(
      'note.report',
      'Daily Report',
      '- [[note]]'
    );

    section.setMeaning([
      new ReviewedNote('a.md', ['checked'], [])
    ]);

    const report = new DailyReport(section);

    const md = report.toMarkdown(2);
    expect(md).toContain('## Daily Report');
  });
});
