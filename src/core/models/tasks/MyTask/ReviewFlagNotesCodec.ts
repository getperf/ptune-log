// File: src/core/models/tasks/review_flags/ReviewFlagNotesCodec.ts
import { ReviewFlag } from './ReviewFlag';

export class ReviewFlagNotesCodec {
  private static readonly PATTERN = /#ptune:review=([^\s]+)/;

  /** notes → reviewFlags */
  static decode(notes?: string): ReviewFlag[] {
    if (!notes) return [];

    const match = notes.match(this.PATTERN);
    if (!match) return [];

    return match[1]
      .split(',')
      .map((v) => v.trim())
      .filter((v): v is ReviewFlag =>
        Object.values(ReviewFlag).includes(v as ReviewFlag),
      );
  }

  /** reviewFlags → notes 用文字列 */
  static encode(flags: ReviewFlag[]): string {
    if (!flags || flags.length === 0) return '';
    return `#ptune:review=${flags.join(',')}`;
  }

  /** notes から review 定義を除去 */
  static strip(notes?: string): string | undefined {
    if (!notes) return undefined;
    return (
      notes
        .replace(this.PATTERN, '')
        .replace(/\s{2,}/g, ' ')
        .trim() || undefined
    );
  }
}
