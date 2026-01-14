// src/features/note_analysis/services/extractors/TaskReviewSummaryExtractor.ts

import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';
import { logger } from 'src/core/services/logger/loggerInstance';
import { i18n } from 'src/i18n';

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
    const ui = i18n.ui.noteAnalysis;

    if (lines.length === 0) {
      logger.warn('[TaskReviewSummaryExtractor] lines empty');
      // i18n置換：「（タスク振り返りが存在しません）」
      return ui.summary.taskReview.empty;
    }

    const raw = lines.join('\n');
    const cleaned = MarkdownCommentBlock.removeAll(raw);
    const cleanedLines = cleaned.split(/\r?\n/);

    let lastHeadingIndex = -1;
    for (let i = 0; i < cleanedLines.length; i++) {
      if (cleanedLines[i].trim().startsWith('#####')) {
        lastHeadingIndex = i;
      }
    }

    logger.debug('[TaskReviewSummaryExtractor] last heading index', {
      index: lastHeadingIndex,
    });

    if (lastHeadingIndex === -1) {
      // i18n置換：「（日次要約が見つかりませんでした）」
      return ui.summary.taskReview.notFound;
    }

    return cleanedLines
      .slice(lastHeadingIndex + 1)
      .join('\n')
      .trim();
  }
}
