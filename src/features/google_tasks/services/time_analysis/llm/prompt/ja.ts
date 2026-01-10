// File: src/features/google_tasks/services/time_analysis/llm/prompt/ja.ts

import { TimeAnalysisPromptParams } from ".";

export function buildTimeAnalysisPromptJa(params: TimeAnalysisPromptParams): string {
  const { yamlText, header } = params;

  return `
以下は 1 日分のタスク実績を YAML 形式で表したデータです。

# ルール（必須）
- 推測や一般論は禁止。データから読み取れる範囲のみを書くこと。
- 原因は断定せず「可能性」として簡潔に述べること。
- 🚫 を含む生活系タスクはすべての分析から除外すること（列挙・集計に含めない）。

# 数値の扱い（必須）
- planned / actual / delta は pomodoro に含まれる。
- delta = actual - planned
- delta の解釈:
  - delta > 0 は「計画超過（遅れ）」を意味する。
  - delta < 0 は「計画未満（前倒し）」を意味する。
- 重要: |delta| < 1.0 は誤差として扱い、「差分が大きいタスク」には絶対に出さないこと。
  - 列挙するのは |delta| >= 1.0 のもののみ（境界は厳守）。
- delta や actual の数値は小数点 1 位で表示すること。
- 差分表記は必ず「+1.5」「-1.5」の形式にすること。

# 親子タスクの扱い（必須）
- parentTaskKey がある場合は子タスクである。
- 親子タスクで親・子の両方に actual がある場合:
  - 親タスクはグロス（合計）として扱う。
  - 「差分が大きいタスク」の列挙は子タスクを優先し、親を重複して問題視しない。
  - 親を出す場合は「合計(グロス)」として補足に留める。

  # 未完了タスクの扱い（必須）
- status=needsAction のタスクは未完了タスクである。
- 未完了タスクについては次のルールを厳守すること。
  - delta < 0 の場合:
    - 作業途中と判断し、「差分が大きいタスク」には絶対に出さない。
    - 遅れ・前倒しの評価コメントも行わない。
  - delta > 0 の場合:
    - 計画超過とみなし、「遅れ」として列挙してよい。

# タイトル表示（最重要：固定）
- タスク名は、「親__子」のような連結が含まれている。
- 出力時のタスク名は、次の形式に必ず変換すること。
  - 子タスク（parentTaskKeyあり）: 「親タスク：子タスク名」
  - 親タスク（parentTaskKeyなし）: タスク名そのまま（長い場合のみ省略可）

YAML:
\`\`\`yaml
${yamlText}
\`\`\`

# 出力してほしい内容
1) 差分が大きいタスク（|delta| >= 1.1 のみ）
   - 箇条書き形式: 「タスク名: +1.5」または「タスク名: -1.5」

2) 作業タイプ別サマリー（tags ベース）
   - 件数は出さない
   - 各タグごとに actual 合計（小数点1位）を示す
3) 日次要約（2〜3行）
   - 遅れ（delta>0）/ 前倒し（delta<0）の傾向を簡潔に
   - 未完了（status=needsAction）の状況があれば1文で触れる（断定しない）

出力は以下の Markdown 構成、日本語、簡潔に。

${header} 差分が大きいタスク

${header} 作業タイプ別サマリー

${header} 日次要約
`.trim();
}