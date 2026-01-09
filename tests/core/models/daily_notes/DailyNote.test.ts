// tests/core/models/daily_notes/DailyNote.test.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { Section } from 'src/core/models/daily_notes/Section';
import { SectionList } from 'src/core/models/daily_notes/SectionList';

const baseNote = () =>
  new DailyNote({
    raw: '',
    plannedTask: new Section({ key: 'task.planned' }),
    taskTimelog: new Section({ key: 'task.timelog' }),
    reviewMemo: new Section({ key: 'note.review.memo' }),
    reviewedNote: new Section({ key: 'note.report' }),
    taskReviews: new SectionList(),
    kpts: new SectionList(),
  });

describe('DailyNote immutable APIs', () => {
  test('updateReviewMemo replaces body immutably', () => {
    const note = baseNote();
    const next = note.updateReviewMemo('memo');

    expect(note.reviewMemo.body).toBe('');
    expect(next.reviewMemo.body).toBe('memo');
  });

  test('appendKpt adds new section', () => {
    const note = baseNote();
    const next = note.appendKpt('kpt1', '(1回目)');

    expect(note.kpts.sections.length).toBe(0);
    expect(next.kpts.sections.length).toBe(1);
    expect(next.kpts.sections[0].suffix).toBe('(1回目)');
    expect(next.kpts.sections[0].body).toBe('kpt1');
  });

  test('appendTimeLog adds new section', () => {
    const note = baseNote();
    const next = note.appendTaskReview('log');

    expect(next.taskReviews.sections.length).toBe(1);
    expect(next.taskReviews.sections[0].body).toBe('log');
  });
});
