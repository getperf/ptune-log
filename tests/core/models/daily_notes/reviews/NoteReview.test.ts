import { NoteReview } from 'src/core/models/daily_notes/reviews/NoteReview';
import { DailyReport } from 'src/core/models/daily_notes/reviews/DailyReport';
import { Section } from 'src/core/models/daily_notes/reviews/Section';
import { ReviewedNote } from 'src/core/models/daily_notes/reviews/ReviewedNote';

describe('NoteReview with DailyReport and KPT array', () => {
  test('outputs daily report and multiple KPTs in order', () => {
    const reportSection = new Section<ReviewedNote[]>(
      'note.report',
      'Daily Report',
      '- [[note]]'
    );
    reportSection.setMeaning([
      new ReviewedNote('a.md', ['x'], [])
    ]);

    const review = new NoteReview(
      new Section('note.tags.daily', 'Daily Tags', '#tag'),
      new Section('note.tags.unregistered', 'Unregistered', ''),
      new DailyReport(reportSection),
      [
        new Section('note.kpt', 'KPT (1st)', 'Keep...'),
        new Section('note.kpt', 'KPT (2nd)', 'Try...')
      ]
    );

    const md = review.toMarkdown(2);

    expect(md).toContain('## Daily Report');
    expect(md).toContain('## KPT (1st)');
    expect(md).toContain('## KPT (2nd)');
    expect(md.indexOf('KPT (1st)')).toBeLessThan(md.indexOf('KPT (2nd)'));
  });
});
