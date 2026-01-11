// File: src/features/daily_review/services/DailyReviewSummaryBuilder.ts

import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

export class DailyReviewSummaryBuilder {
  /**
   * デイリーノート用のサマリ Markdown を生成
   * - 表示形式のみを責務とする
   * - DailyNote や Vault には依存しない
   */
  static build(summaries: NoteSummaries): string {
    return summaries.summaryMarkdown({
      baseHeadingLevel: 3,
      checklist: true,
      sentenceSplit: true,
      withUserReview: true,
    });
  }
}
