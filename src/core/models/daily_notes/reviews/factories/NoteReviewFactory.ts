// src/core/models/daily_notes/reviews/NoteReviewFactory.ts

import { NoteReview } from '../entities/NoteReview';
import { DailyReport } from '../entities/DailyReport';
import { Section } from '../entities/Section';
import { ParsedSection } from '../entities/ParsedSection';
import { SectionKey } from '../specs/SectionKey';
import { DailyReportFactory } from './DailyReportFactory';

export class NoteReviewFactory {
  static create(params: {
    dailyTags: Section<void>;
    dailyReport: DailyReport;
    kpts: Section<void>[];
  }): NoteReview {
    return new NoteReview(params.dailyTags, params.dailyReport, params.kpts);
  }

  static fromSections(sections: ParsedSection[]): NoteReview {
    const dailyTags = this.requireSection(sections, 'note.review.memo');
    const reportSec = this.requireSection(sections, 'note.report');
    const kpts = this.findSections(sections, 'note.kpt');

    return new NoteReview(
      new Section('note.tags.daily', 'note.tags.daily', dailyTags.body),
      DailyReportFactory.fromSection(
        new Section('note.report', 'note.report', reportSec.body)
      ),
      kpts.map((s) => new Section('note.kpt', 'note.kpt', s.body))
    );
  }

  private static requireSection(
    sections: ParsedSection[],
    key: SectionKey
  ): ParsedSection {
    const found = sections.find((s) => s.key === key);
    if (!found) throw new Error(`${key} not found`);
    return found;
  }

  private static findSections(
    sections: ParsedSection[],
    key: SectionKey
  ): ParsedSection[] {
    return sections.filter((s) => s.key === key);
  }
}
