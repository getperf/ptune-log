// src/features/llm_tags/services/analysis/KptReviewSourceBuilder.ts

import { ReviewedNote } from 'src/core/models/daily_notes/ReviewedNote';

export interface KptSourceInput {
  summary: string;
  previousKpt?: string;
  userReviews?: ReviewedNote[];
}

export class KptReviewSourceBuilder {
  build(input: KptSourceInput): string {
    const blocks: string[] = [];

    blocks.push(this.section('当日の作業サマリ（事実）', input.summary));

    if (input.previousKpt) {
      blocks.push(this.section('前回のKPT分析結果（暫定）', input.previousKpt));
    }

    if (input.userReviews && input.userReviews.length > 0) {
      blocks.push(
        this.section(
          'ユーザによる追記レビュー',
          this.formatReviewNotes(input.userReviews)
        )
      );
    }

    return blocks.join('\n\n');
  }

  private section(title: string, body: string): string {
    return `【${title}】\n${body.trim()}`;
  }

  private formatReviewNotes(notes: ReviewedNote[]): string {
    return notes
      .map((note) => {
        const lines: string[] = [];

        lines.push(`#### ${note.notePath}`);

        for (const c of note.checkedSummaries) {
          lines.push(`- [x] ${c}`);
        }

        for (const r of note.userReviews) {
          lines.push(`- ${r}`);
        }

        return lines.join('\n');
      })
      .join('\n\n');
  }
}
