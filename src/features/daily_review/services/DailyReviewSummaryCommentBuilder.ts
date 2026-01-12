// src/features/daily_review/services/DailyReviewSummaryCommentBuilder.ts

export class DailyReviewSummaryCommentBuilder {
  static build(): string {
    return `
※ 以下は、当日の作業内容をもとに LLM が生成した要約です。
内容に誤りや補足がある行はチェックし、レビューコメントを追加してください。
このレビュー内容は後続の KPT 分析に利用されます。
`.trim();
  }
}
