// File: src/features/llm_tags/services/summary_review/SummaryReviewMarkdownBuilder.ts

import { SummarySentence } from './SummarySentence';

export class SummaryReviewMarkdownBuilder {
  static build(sentences: SummarySentence[]): string {
    return sentences
      .map((s) => `- [${s.flagged ? 'x' : ' '}] ${s.text}`)
      .join('\n');
  }
}
