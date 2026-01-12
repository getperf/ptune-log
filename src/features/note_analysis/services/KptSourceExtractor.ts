// src/features/note_analysis/services/KptSourceExtractor.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { KptSource } from '../models/KptSource';
import { TaskReviewSummaryExtractor } from './extractors/TaskReviewSummaryExtractor';
import { NoteReviewSummaryExtractor } from './extractors/NoteReviewSummaryExtractor';

/**
 * KptSourceExtractor
 * - DailyNote から KPT分析用の入力データを構築する
 * - セクション取得と Markdown 抽出の橋渡し役
 */
export class KptSourceExtractor {
  private readonly taskExtractor = new TaskReviewSummaryExtractor();
  private readonly noteExtractor = new NoteReviewSummaryExtractor();

  extract(dailyNote: DailyNote): KptSource {
    return {
      taskReviewSummary: this.extractTaskReviewSummary(dailyNote),
      noteReviewSummary: this.extractNoteReviewSummary(dailyNote),
    };
  }

  /**
   * タスク振り返り要約の抽出
   *
   * @remarks
   * - 現在は latest の timelog セクションを使用
   * - セクション構造確定後にロジック強化予定
   */
  private extractTaskReviewSummary(dailyNote: DailyNote): string {
    const latest = dailyNote.taskReviews.sections[0];
    if (!latest) {
      return '（タスク振り返りが存在しません）';
    }

    return this.taskExtractor.extract(latest.getRawLines());
  }

  /**
   * ノート振り返り要約の抽出
   */
  private extractNoteReviewSummary(dailyNote: DailyNote): string {
    if (!dailyNote.reviewedNote?.hasContent()) {
      return '（ノートレビューが存在しません）';
    }

    return this.noteExtractor.extract(dailyNote.reviewedNote.getRawLines());
  }
}
