// src/core/models/daily_notes/reviews/NoteReviewFactory.ts

import { NoteReview } from '../entities/NoteReview';
import { DailyReport } from '../entities/DailyReport';
import { Section } from '../entities/Section';

export class NoteReviewFactory {
  static create(params: {
    dailyTags: Section<void>;
    dailyReport: DailyReport;
    kpts: Section<void>[];
  }): NoteReview {
    return new NoteReview(params.dailyTags, params.dailyReport, params.kpts);
  }
}
