// File: src/features/google_tasks/services/time_analysis/llm/TimeAnalysisPromptBuilder.ts

export class TimeAnalysisPromptBuilder {
  /**
   * user プロンプトのみ生成
   */
  buildUserPrompt(yamlText: string): string {
    return `
以下は 1 日分のタスク実績を YAML 形式で表したデータです。

前提:
- tasks はタスク単位の status / pomodoro / delta を含みます
- status = needsAction は「未完了」を意味します
- delta は planned と actual の差分です
- delta > 0 は「計画より時間が掛かった（遅れ）」ことを意味します
- delta < 0 は「計画より短時間で完了した」ことを意味します
- delta > 0 のタスクを成果や好結果として評価しないでください
- 🚫 を含む生活系タスクはすべての分析から除外してください
- 推測や一般論は書かず、データから読み取れる範囲のみを要約してください
- 原因は断定せず「可能性」として簡潔に述べてください

YAML:
\`\`\`yaml
${yamlText}
\`\`\`

次の観点で簡潔にまとめてください。

1. 計画との差分が大きいタスク（±1以上）の一覧と差分
2. tags から集計できる作業タイプ別の実績傾向
3. 未完了タスク（status=needsAction）がある場合、その概要と考えられる状況
4. 1日の特徴を 2〜3 行で要約

出力は以下の Markdown 構成、日本語、簡潔にしてください。

## 差分が大きいタスク

## 作業タイプ別サマリー

## 日次要約
`;
  }
}
