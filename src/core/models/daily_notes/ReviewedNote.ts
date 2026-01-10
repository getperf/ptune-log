// src/core/models/daily_notes/ReviewedNote.ts

export class ReviewedNote {
  constructor(
    public readonly notePath: string,
    public readonly checkedSummaries: string[],
    public readonly userReviews: string[]
  ) {}

  isEmpty(): boolean {
    return this.checkedSummaries.length === 0 && this.userReviews.length === 0;
  }
}
