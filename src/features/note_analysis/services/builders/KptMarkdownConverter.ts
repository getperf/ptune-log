// src/features/llm_tags/services/converters/KptMarkdownConverter.ts

import { KPTResult } from 'src/core/models/daily_notes/KPTResult';
import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';

export class KptMarkdownConverter {
  private static readonly KIND = 'kpt-result';

  static convert(result: KPTResult): string {
    const out: string[] = [];

    this.appendSection(out, 'Keep', result.Keep);
    this.appendSection(out, 'Problem', result.Problem);
    this.appendSection(out, 'Try', result.Try);

    return MarkdownCommentBlock.build(out);
  }

  private static appendSection(
    out: string[],
    title: keyof KPTResult,
    items: string[]
  ): void {
    if (items.length === 0) return;

    out.push(`#### ${title}`, ...items.map((item) => `- ${item}`));
  }
}
