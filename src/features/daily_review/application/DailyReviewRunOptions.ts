// src/features/daily_review/application/DailyReviewRunOptions.ts

export type SentenceMode = 'raw' | 'llm';
export type NoteSummaryOutputFormat = 'outliner' | 'xmind';

export type DailyReviewRunOptions = {
  forceRegenerate: boolean;
  sentenceMode: SentenceMode;
  outputFormat: NoteSummaryOutputFormat;
};
