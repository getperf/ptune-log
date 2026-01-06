// src/core/models/daily_notes/reviews/entities/NoteReview.ts
import { Section } from '../Section';
import { DailyReport } from './DailyReport';

export class NoteReview {
  constructor(
    public readonly reviewMemo: Section<void>,
    public readonly dailyReport: DailyReport,
    public readonly kpts: Section<void>[]
  ) {}

  /** 振り返りメモが存在するか（= レビュー領域があるか） */
  hasReviewMemo(): boolean {
    return !this.reviewMemo.isEmpty();
  }

  /** デイリーレポートが存在するか */
  hasDailyReport(): boolean {
    return this.dailyReport.hasReviewedNotes();
  }
}
