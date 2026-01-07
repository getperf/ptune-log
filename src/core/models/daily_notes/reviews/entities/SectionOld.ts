// src/core/models/daily_notes/reviews/entities/Section.ts
import { ParsedSection } from 'src/core/models/daily_notes/reviews';

export type MarkdownText = string;

export class SectionOld<TMeaning = void> {
  private meaning?: TMeaning;

  constructor(
    public readonly key: string,
    public heading: string,
    private raw: MarkdownText
  ) {}

  /* ===== factory helpers ===== */

  /** 空セクション生成（Factory 用） */
  static empty<T = void>(key: string, heading?: string): SectionOld<T> {
    return new SectionOld<T>(key, heading ?? key, '');
  }

  /** ParsedSection → Section 変換 */
  static fromParsed<T = void>(parsed: ParsedSection): SectionOld<T> {
    return new SectionOld<T>(parsed.key, parsed.key, parsed.body);
  }

  /** ParsedSection | undefined → Section（null-safe） */
  static fromParsedOrEmpty<T = void>(
    parsed: ParsedSection | undefined,
    key: string
  ): SectionOld<T> {
    return parsed ? SectionOld.fromParsed<T>(parsed) : SectionOld.empty<T>(key);
  }

  /* ===== accessors ===== */

  get markdown(): MarkdownText {
    return this.raw;
  }

  replace(markdown: MarkdownText): void {
    this.raw = markdown;
    this.meaning = undefined;
  }

  append(markdown: MarkdownText): void {
    if (this.raw.trim().length === 0) {
      this.raw = markdown;
    } else {
      this.raw += `\n${markdown}`;
    }
  }
  isEmpty(): boolean {
    return this.raw.trim().length === 0;
  }

  toMarkdown(level = 2): MarkdownText {
    const prefix = '#'.repeat(level);
    return `${prefix} ${this.heading}\n\n${this.raw}`.trim();
  }
}
