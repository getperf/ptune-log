// src/features/note_analysis/services/KptSourceExtractor.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
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
    const latest = dailyNote.taskReviews.sections[0];
    if (!latest) {
      return '（タスク振り返りが存在しません）';
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
    if (!dailyNote.reviewedNote?.hasContent()) {
      return '（ノートレビューが存在しません）';
    }

    const rawMarkdown = dailyNote.reviewedNote.getRawLines().join('\n');

    const cleaned = MarkdownCommentBlock.removeAll(rawMarkdown);
    const reviewedNotes = this.noteReviewExtractor.extract(cleaned);
    if (reviewedNotes.length === 0) {
      return '（ノートレビューに有効な項目がありません）';
    }

    return KptReviewMarkdownBuilder.build(reviewedNotes);
  }
}
