// src/features/llm_tags/services/analysis/KptReviewContext.ts

import { ReviewedNote } from 'src/core/models/daily_notes/ReviewedNote';
import { KptPhase } from './KptPhase';

export interface KptReviewContext {
  phase: KptPhase;
  summaryMarkdown: string;
  previousKptMarkdown?: string;
  userReviews?: ReviewedNote[];
}
