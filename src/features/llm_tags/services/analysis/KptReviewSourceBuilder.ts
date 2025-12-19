// src/features/llm_tags/services/analysis/kpt2/services/KptReviewSourceBuilder.ts
import { ReviewNote } from "src/features/llm_tags/services/analysis/ReviewNote";

export class KptReviewSourceBuilder {
  build(notes: ReviewNote[]): string {
    const lines: string[] = [];

    lines.push('ユーザレビュー');
    lines.push('');

    for (const note of notes) {
      lines.push(`##### ${note.notePath}`);

      for (const c of note.checkedSummaries) {
        lines.push(`- [x] ${c}`);
      }

      for (const r of note.userReviews) {
        lines.push(`- ${r}`);
      }

      lines.push('');
    }

    return lines.join('\n').trim();
  }
}
