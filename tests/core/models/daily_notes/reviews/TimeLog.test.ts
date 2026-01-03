import { TimeLog } from 'src/core/models/daily_notes/reviews/TimeLog';
import { Section } from 'src/core/models/daily_notes/reviews/Section';

describe('TimeLog', () => {
  test('outputs non-empty sections only', () => {
    const log = new TimeLog(
      new Section('tt', 'Time Table', 'table'),
      new Section('bl', 'Backlog', ''),
      new Section('an', 'Analysis', 'summary')
    );

    const md = log.toMarkdown(3);

    expect(md).toContain('### Time Table');
    expect(md).toContain('### Analysis');
    expect(md).not.toContain('### Backlog');
  });
});
