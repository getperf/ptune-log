// tests/core/models/daily_notes/Section.test.ts

import { Section } from 'src/core/models/daily_notes/Section';

describe('Section', () => {
  test('replaceBody sets body and present', () => {
    const s = new Section({ key: 'note.review.memo' });
    const next = s.replaceBody('hello');

    expect(next.body).toBe('hello');
    expect(next.present).toBe(true);
    expect(s.body).toBe(''); // immutable
  });

  test('appendBody appends with blank line', () => {
    const s = new Section({
      key: 'note.review.memo',
      body: 'a',
      present: true,
    });
    const next = s.appendBody('b');

    expect(next.body).toBe('a\n\nb');
  });

  test('isEmpty works', () => {
    const s = new Section({ key: 'note.review.memo' });
    expect(s.isEmpty()).toBe(true);
  });
});
