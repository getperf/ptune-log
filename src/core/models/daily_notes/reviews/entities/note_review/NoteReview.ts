// src/core/models/daily_notes/reviews/entities/NoteReview.ts
import { SectionOld } from '../SectionOld';
import { DailyReport } from './DailyReport';

export class NoteReview {
  constructor(
    public readonly reviewMemo: SectionOld<void>,
    public readonly dailyReport: DailyReport,
    public readonly kpts: SectionOld<void>[]
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
