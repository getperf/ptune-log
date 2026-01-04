// tests/core/models/daily_notes/reviews/DailyReportFactory.test.ts

import { Section } from 'src/core/models/daily_notes/reviews';
import { DailyReportFactory } from 'src/core/models/daily_notes/reviews';

describe('DailyReportFactory', () => {
  it('creates DailyReport with reviewedNotes array', () => {
    const markdown = `
##### [[note/A]]
- [x] checked A

###### ユーザレビュー
- review A

##### [[note/B]]
- [ ] unchecked B

###### ユーザレビュー
- 
`;

    const section = new Section<void>('note.report', 'note.report', markdown);

    const report = DailyReportFactory.fromSection(section);

    expect(report.section).toBe(section);
    expect(report.reviewedNotes.length).toBe(1);

    expect(report.reviewedNotes[0].notePath).toBe('note/A');
    expect(report.reviewedNotes[0].checkedSummaries).toEqual(['checked A']);
    expect(report.reviewedNotes[0].userReviews).toEqual(['review A']);
  });
});
