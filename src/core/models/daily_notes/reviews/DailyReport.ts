import { Section } from './Section';
import { ReviewedNote } from './ReviewedNote';

/**
 * DailyReport
 * - ReviewedNote を束ねる編集系レポート
 */
export class DailyReport {
  constructor(
    public readonly reviewedNotes: Section<ReviewedNote[]>
  ) { }

  /** ReviewedNote が実質空かどうか */
  isEmpty(): boolean {
    const notes = this.reviewedNotes.getMeaning();
    if (!notes) {
      return this.reviewedNotes.isEmpty();
    }
    return notes.every(n => n.isEmpty());
  }

  /** 表示用 Markdown */
  toMarkdown(level = 2): string {
    if (this.isEmpty()) {
      return '';
    }
    return this.reviewedNotes.toMarkdown(level);
  }
}
