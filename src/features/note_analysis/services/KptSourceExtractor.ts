// src/features/note_analysis/services/KptSourceExtractor.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { i18n } from 'src/i18n';
import { KptSource } from '../models/KptSource';
import { TaskReviewSummaryExtractor } from './extractors/TaskReviewSummaryExtractor';
import { DailyReportReviewExtractor } from './extractors/DailyReportReviewExtractor';
import { KptReviewMarkdownBuilder } from './builders/KptReviewMarkdownBuilder';
import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';

/**
 * KptSourceExtractor
 * - DailyNote から KPT分析用の入力データを構築する
 * - コメント除去／構造抽出／Markdown生成の調停役
 */
export class KptSourceExtractor {
  private readonly taskExtractor = new TaskReviewSummaryExtractor();
  private readonly noteReviewExtractor = new DailyReportReviewExtractor();

  extract(dailyNote: DailyNote): KptSource {
    return {
      taskReviewSummary: this.extractTaskReviewSummary(dailyNote),
      noteReviewSummary: this.extractNoteReviewSummary(dailyNote),
    };
  }

  /**
   * タスク振り返り要約の抽出
   */
  private extractTaskReviewSummary(dailyNote: DailyNote): string {
    const ui = i18n.ui.noteAnalysis;

    const latest = dailyNote.taskReviews.sections[0];
    if (!latest) {
      // i18n置換：「（タスク振り返りが存在しません）」
      return ui.summary.taskReview.empty;
    }

    return this.taskExtractor.extract(latest.getRawLines());
  }

  /**
   * ノート振り返り要約の抽出（KPT用）
   *
   * 処理手順:
   * 1. kind コメント除去
   * 2. レビュー構造抽出（順序保持）
   * 3. KPT用 Markdown 生成
   */
  private extractNoteReviewSummary(dailyNote: DailyNote): string {
    const ui = i18n.ui.noteAnalysis;

    if (!dailyNote.reviewedNote?.hasContent()) {
      // i18n置換：「（ノートレビューが存在しません）」
      return ui.summary.noteReview.empty;
    }

    const rawMarkdown = dailyNote.reviewedNote.getRawLines().join('\n');

    const cleaned = MarkdownCommentBlock.removeAll(rawMarkdown);
    const reviewedNotes = this.noteReviewExtractor.extract(cleaned);
    if (reviewedNotes.length === 0) {
      // i18n置換：「（ノートレビューに有効な項目がありません）」
      return ui.summary.noteReview.noValidItems;
    }

    return KptReviewMarkdownBuilder.build(reviewedNotes);
  }
}
