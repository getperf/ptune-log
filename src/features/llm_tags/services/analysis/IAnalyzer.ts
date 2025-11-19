// File: src/features/llm_tags/services/analysis/IAnalyzer.ts
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';

export interface IAnalyzer {
  analyze(summaries: NoteSummaries, options?: any): Promise<void>;
}
