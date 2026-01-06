// src/core/models/daily_notes/reviews/DailyReportFactory.ts

import { Section } from '../entities/Section';
import { DailyReport } from '../entities/note_review/DailyReport';
import { ReviewedNote } from '../entities/note_review/ReviewedNote';
import { DailyReportReviewExtractor } from 'src/features/llm_tags/services/analysis/DailyReportReviewExtractor';

/**
 * DailyReportFactory
 * - DailyReport を生成（構造解釈はしない）
 * - ReviewedNote は Extractor の結果をそのまま保持
 */
export class DailyReportFactory {
  private static extractor = new DailyReportReviewExtractor();

  static fromSection(section: Section<void>): DailyReport {
    const reviewedNotes: ReviewedNote[] = this.extractor.extract(
      section.markdown
    );
    return new DailyReport(section, reviewedNotes);
  }

  static empty(): DailyReport {
    return new DailyReport(
      new Section<void>('note.report', 'note.report', ''),
      []
    );
  }
}
