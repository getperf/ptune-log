// src/core/models/daily_notes/reviews/Section.ts

export type MarkdownText = string;

/**
 * Section
 * - Markdown を保持する基本単位
 * - TMeaning を指定した場合のみ「意味モデル」を持つ
 *
 * TMeaning = void の場合：
 *   - 意味モデルは保持できない（生成系・非編集セクション用）
 */
export class Section<TMeaning = void> {
  private meaning?: TMeaning;

  constructor(
    public readonly key: string,
    public heading: string,
    private raw: MarkdownText
  ) { }

  /** 生 Markdown */
  get markdown(): MarkdownText {
    return this.raw;
  }

  /** Markdown 差し替え
   * - 意味モデルがある場合は破棄される
   */
  replace(markdown: MarkdownText): void {
    this.raw = markdown;
    this.meaning = undefined;
  }

  /** Markdown 追記 */
  append(markdown: MarkdownText): void {
    this.raw += `\n${markdown}`;
  }

  /** 意味モデル設定（TMeaning 指定時のみ意味がある） */
  setMeaning(meaning: TMeaning): void {
    this.meaning = meaning;
  }

  /** 意味モデル取得 */
  getMeaning(): TMeaning | undefined {
    return this.meaning;
  }

  /** 空判定（Markdown ベース） */
  isEmpty(): boolean {
    return this.raw.trim().length === 0;
  }

  /** 見出し付き Markdown 出力 */
  toMarkdown(level = 2): MarkdownText {
    const prefix = '#'.repeat(level);
    return `${prefix} ${this.heading}\n\n${this.raw}`.trim();
  }
}
