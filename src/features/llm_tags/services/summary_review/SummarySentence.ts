// File: src/features/llm_tags/services/summary_review/SummarySentence.ts

export interface SummarySentence {
  text: string;
  flagged: boolean; // true = 事実と異なる
  source: 'llm' | 'user';
}
