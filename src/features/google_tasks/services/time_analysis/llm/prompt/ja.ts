// File: src/features/google_tasks/services/time_analysis/llm/prompt/ja.ts

import { TimeAnalysisPromptParams } from '.';

export function buildTimeAnalysisPromptJa(
  params: TimeAnalysisPromptParams,
): string {
  const { yamlText, header } = params;

  return `
以下は 1 日分のタスク実績を YAML 形式で表したデータです。

# 基本ルール（必須）
- 推測や一般論は禁止。YAML に記載された事実のみを書くこと。
- 評価・改善案・対策は書かず、観測された内容の整理に徹すること。
- 🚫 を含む生活系タスクは、すべての分析から除外すること。

# 数値の扱い（必須）
- planned / actual / delta は pomodoro に含まれる。
- delta = actual - planned
- 解釈:
  - delta > 0 : 計画超過（遅れ）
  - delta < 0 : 計画未満（前倒し）
- |delta| < 1.0 は誤差として扱い、分析対象から除外する。
- 列挙するのは |delta| >= 1.0 のタスクのみ。
- 数値は小数点1位、差分表記は「+1.5」「-1.5」の形式に統一する。

# 親子タスクの扱い（必須）
- parentTaskKey があるものは子タスク。
- 親子とも actual がある場合:
  - 親はグロス（合計）として扱う。
  - 差分の列挙は子タスクを優先する。
  - 親を出す場合は「合計(グロス)」と補足する。

# 未完了タスク（status=needsAction）
- delta < 0 の場合:
  - 作業途中とみなし、差分の列挙や評価は行わない。
- delta > 0 の場合:
  - 計画超過として事実のみを列挙してよい。

# reviewFlags の扱い（重要）
reviewFlags は、ユーザが「完了したが問題や宿題が残った」と記録した事実である。

各 reviewFlags の意味は以下の通り：

- stuckUnknown: 原因が特定できないまま作業が停滞した
- toolOrEnvIssue: ツール・環境・設定に起因する問題が発生した
- decisionPending: 判断が保留のまま作業が進行・完了した
- scopeExpanded: 作業途中で想定外に作業範囲が拡大した
- unresolved: 完了扱いだが未解決の事項が残っている
- newIssueFound: 作業中に新たな問題が発見された

reviewFlags が付与されたタスクについては、
status が completed であっても、**評価や対策を述べず**、
以下の事実を簡潔に整理すること。

- どのような状態・出来事が発生していたか
- 何が未確定・未解決のまま残っているか

# タイトル表示（固定）
- タスク名は必ず次の形式に変換する。
  - 子タスク: 「親タスク：子タスク名」
  - 親タスク: タスク名そのまま（長い場合のみ省略可）

YAML:
\`\`\`yaml
${yamlText}
\`\`\`

# 出力してほしい内容
1) 差分が大きいタスク（|delta| >= 1.0）
   - 箇条書き: 「タスク名: +1.5」「タスク名: -1.5」

2) 作業タイプ別サマリー（tags ベース）
   - 件数は出さない
   - 各タグごとに actual 合計（小数点1位）

3) 完了タスクに残った問題・宿題
   - reviewFlags が付いたタスクのみ対象
   - 評価・改善案は書かず、事実・状態のみを列挙する

4) 日次要約（2〜3行）
   - 遅れ / 前倒しの全体傾向を事実ベースで整理
   - 未完了タスクや reviewFlags 付きタスクの存在に 1 文で触れる

出力は以下の Markdown 構成、日本語、簡潔に。

${header} 差分が大きいタスク

${header} 作業タイプ別サマリー

${header} 完了タスクに残った問題・宿題

${header} 日次要約
`.trim();
}
