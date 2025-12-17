// File: src/features/llm_tags/services/summary_review/SummarySentenceParser.ts

import { SummarySentence } from './SummarySentence';

/**
 * LLM 生成の要約テキストをセンテンス配列に変換
 */
export class SummarySentenceParser {
  static parse(text: string): SummarySentence[] {
    return text
      .split(/(?<=[。．.!?])\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map<SummarySentence>((s) => ({
        text: s,
        flagged: false,
        source: 'llm',
      }));
  }
}
