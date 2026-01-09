// tests/core/models/daily_notes/SectionList.test.ts

import { SectionList } from 'src/core/models/daily_notes/SectionList';
import { Section } from 'src/core/models/daily_notes/Section';

describe('SectionList', () => {
  test('append returns new list', () => {
    const list = new SectionList();
    const s = new Section({ key: 'note.kpt', body: 'k1', present: true });

    const next = list.append(s);

    expect(list.sections.length).toBe(0);
    expect(next.sections.length).toBe(1);
    expect(next.sections[0].body).toBe('k1');
  });

  test('map returns new list', () => {
    const list = new SectionList([
      new Section({ key: 'note.kpt', body: 'a', present: true }),
    ]);

    const next = list.map((s) => s.replaceBody('b'));

    expect(list.sections[0].body).toBe('a');
    expect(next.sections[0].body).toBe('b');
  });
});
