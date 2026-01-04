import { Section } from './Section';
import { ReviewedNote } from './ReviewedNote';

/**
 * DailyReport
 * - ReviewedNote を束ねる編集系レポート
 */
export class DailyReport {
  constructor(
    public readonly section: Section<void>,
    public readonly reviewedNotes: ReviewedNote[]
  ) { }
}
