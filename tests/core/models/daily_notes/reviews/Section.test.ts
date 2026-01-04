import { Section } from 'src/core/models/daily_notes/reviews';
import { ReviewedNote } from 'src/core/models/daily_notes/reviews';

describe('Section (common behavior)', () => {
  test('stores and returns markdown', () => {
    const section = new Section('key', 'Heading', 'content');
    expect(section.markdown).toBe('content');
  });

  test('replace overwrites markdown', () => {
    const section = new Section('key', 'Heading', 'old');
    section.replace('new');
    expect(section.markdown).toBe('new');
  });

  test('append adds markdown with newline', () => {
    const section = new Section('key', 'Heading', 'base');
    section.append('more');
    expect(section.markdown).toBe('base\nmore');
  });

  test('toMarkdown outputs heading and body', () => {
    const section = new Section('key', 'Heading', 'body');
    expect(section.toMarkdown(2)).toBe('## Heading\n\nbody');
  });

  test('isEmpty returns true for blank markdown', () => {
    const section = new Section('key', 'Heading', '   ');
    expect(section.isEmpty()).toBe(true);
  });
});

describe('Section<void> (no meaning model)', () => {
  test('meaning is always undefined', () => {
    const section = new Section<void>('key', 'Heading', 'content');
    expect(section.getMeaning()).toBeUndefined();
  });

  test('replace does not cause errors without meaning', () => {
    const section = new Section<void>('key', 'Heading', 'old');
    section.replace('new');
    expect(section.markdown).toBe('new');
    expect(section.getMeaning()).toBeUndefined();
  });
});

describe('Section<TMeaning> (with meaning model)', () => {
  test('setMeaning and getMeaning work', () => {
    const section = new Section<ReviewedNote[]>('note.report', 'Report', 'md');
    const meaning = [new ReviewedNote('a.md', ['x'], [])];

    section.setMeaning(meaning);
    expect(section.getMeaning()).toBe(meaning);
  });

  test('replace clears meaning model', () => {
    const section = new Section<ReviewedNote[]>('note.report', 'Report', 'old');
    section.setMeaning([new ReviewedNote('a.md', [], ['memo'])]);

    section.replace('new');

    expect(section.markdown).toBe('new');
    expect(section.getMeaning()).toBeUndefined();
  });
});
