import { ReviewedNote } from 'src/core/models/daily_notes/reviews';

describe('ReviewedNote', () => {
  test('isEmpty returns true when both arrays are empty', () => {
    const note = new ReviewedNote('path/to/note.md', [], []);
    expect(note.isEmpty()).toBe(true);
  });

  test('isEmpty returns false when checkedSummaries exists', () => {
    const note = new ReviewedNote('path/to/note.md', ['summary'], []);
    expect(note.isEmpty()).toBe(false);
  });

  test('isEmpty returns false when userReviews exists', () => {
    const note = new ReviewedNote('path/to/note.md', [], ['review']);
    expect(note.isEmpty()).toBe(false);
  });
});
