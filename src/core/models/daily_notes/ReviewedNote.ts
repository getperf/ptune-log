// src/core/models/daily_notes/ReviewedNote.ts（例）

export class ReviewedNote {
  constructor(
    public readonly title: string,
    public readonly checked: string[],
    public readonly unchecked: string[],
    public readonly reviews: string[]
  ) {}

  isEmpty(): boolean {
    return (
      this.checked.length === 0 &&
      this.unchecked.length === 0 &&
      this.reviews.length === 0
    );
  }
}
