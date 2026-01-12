// src/features/note_analysis/services/extractors/TaskReviewSummaryExtractor.ts

/**
 * TaskReviewSummaryExtractor
 * - タスク振り返りセクション Markdown から
 *   日次要約テキストを抽出する
 *
 * ※ プロト検証用（ロジック簡易）
 */
export class TaskReviewSummaryExtractor {
  extract(lines: string[]): string {
    const startIndex = lines.findIndex(
      (l) => l.trim().startsWith('#####') && l.includes('日次要約')
    );

    if (startIndex === -1) {
      // プロト用ダミー
      return '（日次要約が見つかりませんでした）';
    }

    return lines
      .slice(startIndex + 1)
      .join('\n')
      .trim();
  }
}
