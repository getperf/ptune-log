// File: src/features/llm_tags/services/summary_review/SummaryReviewPrompt.ts

export class SummaryReviewPrompt {
  /** 初回要約＋KPT 用 */
  static initial(): string {
    return `
以下のノート内容を事実ベースで要約してください。
推測や誇張は避け、後で人が検証できる文にしてください。
その後、Keep / Problem / Try を生成してください。
`;
  }

  /** 再分析用（スケルトン） */
  static refine(): string {
    return `
以下は要約センテンスと、その中で事実と異なると
ユーザーが指摘した文です。
指摘内容を Problem として分析し、Try を提案してください。
`;
  }
}
