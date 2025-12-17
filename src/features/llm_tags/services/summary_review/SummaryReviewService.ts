// File: src/features/llm_tags/services/summary_review/SummaryReviewService.ts

import { SummarySentence } from './SummarySentence';
import { SummarySentenceParser } from './SummarySentenceParser';
import { SummaryReviewPrompt } from './SummaryReviewPrompt';
import { LLMClient } from 'src/core/services/llm/LLMClient';

export class SummaryReviewService {
  constructor(private readonly llm: LLMClient) {}

  /** 1回目：要約＋KPT */
  async runInitialReview(noteText: string): Promise<{
    sentences: SummarySentence[];
    kptText: string;
  }> {
    const response = await this.llm.complete(
      SummaryReviewPrompt.initial(),
      noteText
    );

    // TODO: レスポンス分解（要約部 / KPT部）
    const summaryText = response; // 仮
    if (!summaryText) throw new Error('LLM応答が空です');

    const sentences = SummarySentenceParser.parse(summaryText);

    return {
      sentences,
      kptText: response, // 仮
    };
  }

  /** 2回目以降：再分析（スケルトン） */
  async runRefineReview(_sentences: SummarySentence[]): Promise<void> {
    // TODO:
    // - flagged センテンス抽出
    // - refine プロンプト投入
    // - KPT 再生成
  }
}
