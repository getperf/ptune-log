// src/features/note_analysis/services/extractors/NoteReviewSummaryExtractor.ts

/**
 * NoteReviewSummaryExtractor
 * - デイリーレポート（reviewedNote）Markdown から
 *   レビュー要約を抽出する
 *
 * ※ プロト検証用（ロジック簡易）
 */
export class NoteReviewSummaryExtractor {
  extract(lines: string[]): string {
    return (
      lines
        // コメント行（※）を除外
        .filter((l) => !l.trim().startsWith('※'))
        // Wikiリンク [[path|title]] → title
        .map((l) => l.replace(/\[\[[^|]+\|([^\]]+)\]\]/g, '$1'))
        .join('\n')
        .trim()
    );
  }
}
