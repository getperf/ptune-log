// src/features/llm_tags/services/analysis/kpt2/models/ReviewNote.ts
export class ReviewNote {
  constructor(
    public readonly notePath: string,
    public readonly checkedSummaries: string[],
    public readonly userReviews: string[]
  ) { }

  isEmpty(): boolean {
    return this.checkedSummaries.length === 0 && this.userReviews.length === 0;
  }
}
