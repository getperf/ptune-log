// src/core/models/daily_notes/reviews/factories/NoteReviewFactory.ts
import { NoteReview } from '../entities/note_review/NoteReview';
import { DailyReportFactory } from './DailyReportFactory';
import { Section } from '../entities/Section';
import { ParsedSection } from 'src/core/models/daily_notes/reviews';
import { SectionKey } from '../specs/SectionKey';
import { DailyReport } from '../entities/note_review/DailyReport';

export class NoteReviewFactory {
  static build(sections: ParsedSection[]): NoteReview {
    const reviewMemo = Section.fromParsedOrEmpty(
      this.findSection(sections, 'note.review.memo'),
      'note.review.memo'
    );

    const dailyReport = (() => {
      const parsed = this.findSection(sections, 'note.report');
      return parsed
        ? DailyReportFactory.fromSection(Section.fromParsed(parsed))
        : DailyReport.empty('note.report');
    })();

    const kpts = this.findAll(sections, 'note.kpt').map((s) =>
      Section.fromParsed(s)
    );

    return new NoteReview(reviewMemo, dailyReport, kpts);
  }

  private static findSection(
    sections: ParsedSection[],
    key: SectionKey
  ): ParsedSection | undefined {
    return sections.find((s) => s.key === key);
  }

  private static findAll(
    sections: ParsedSection[],
    key: SectionKey
  ): ParsedSection[] {
    return sections.filter((s) => s.key === key);
  }
}
