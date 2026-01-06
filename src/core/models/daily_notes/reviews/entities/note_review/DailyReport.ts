import { Section } from '../Section';
import { ReviewedNote } from './ReviewedNote';
import { SectionKey } from '../../specs/SectionKey';

/**
 * DailyReport
 * - ReviewedNote を束ねる編集系レポート
 */
export class DailyReport {
  constructor(
    public readonly section: Section<void>,
    public readonly reviewedNotes: ReviewedNote[]
  ) {}

  static empty(key: SectionKey): DailyReport {
    return new DailyReport(new Section<void>(key, key, ''), []);
  }

  hasReviewedNotes(): boolean {
    return this.reviewedNotes.length > 0;
  }
}
