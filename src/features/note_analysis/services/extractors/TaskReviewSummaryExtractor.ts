// src/features/note_analysis/services/extractors/TaskReviewSummaryExtractor.ts

import { KindCommentBlock } from 'src/core/utils/markdown/KindCommentBlock';

/**
 * TaskReviewSummaryExtractor
 * - タスク振り返りセクション Markdown から
 *   日次要約テキストを抽出する
 *
 * 抽出ルール:
 * - kind コメントを事前に除去
 * - セクション内の「最後の見出し（#####）」以降を対象
 */
export class TaskReviewSummaryExtractor {
  extract(lines: string[]): string {
    if (lines.length === 0) {
      return '（タスク振り返りが存在しません）';
    }

    // 1. kind コメント除去
    const raw = lines.join('\n');
    const cleaned = KindCommentBlock.removeAll(raw);
    const cleanedLines = cleaned.split(/\r?\n/);

    // 2. 最後の見出し位置を探索
    let lastHeadingIndex = -1;
    for (let i = 0; i < cleanedLines.length; i++) {
      if (cleanedLines[i].trim().startsWith('#####')) {
        lastHeadingIndex = i;
      }
    }

    if (lastHeadingIndex === -1) {
      return '（日次要約が見つかりませんでした）';
    }

    // 3. 見出し直下〜末尾を抽出
    return cleanedLines
      .slice(lastHeadingIndex + 1)
      .join('\n')
      .trim();
  }
}
