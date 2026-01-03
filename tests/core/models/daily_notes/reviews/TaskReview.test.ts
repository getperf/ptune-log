import { TaskReview } from 'src/core/models/daily_notes/reviews/TaskReview';
import { TimeLog } from 'src/core/models/daily_notes/reviews/TimeLog';
import { Section } from 'src/core/models/daily_notes/reviews/Section';

describe('TaskReview with TimeLogs', () => {
  test('stores multiple time logs and outputs in order', () => {
    const review = new TaskReview(
      new Section('task.planned', 'Planned', '- task')
    );

    review.addTimeLog(
      new TimeLog(
        new Section('tt1', 'Time Table', 'A'),
        new Section('bl1', 'Backlog', 'C'),
        new Section('an1', 'Analysis', 'X')
      )
    );

    review.addTimeLog(
      new TimeLog(
        new Section('tt2', 'Time Table', 'B'),
        new Section('bl2', 'Backlog', ''),
        new Section('an2', 'Analysis', 'Y')
      )
    );

    const md = review.toMarkdown(2);

    expect(md).toContain('A');
    expect(md).toContain('B');
    expect(md.indexOf('A')).toBeLessThan(md.indexOf('B'));
  });
});
