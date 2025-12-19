// File: src/features/llm_tags/services/analysis/KPTAnalyzer.ts
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { KPT_FULL_PROMPT, KPT_KEEP_ONLY_PROMPT } from '../../templates/kpt_template';
import { KptPhase } from './KptPhase';

export interface KptAnalyzeRequest {
  phase: KptPhase;
  sourceText: string;
}

export interface KPTResult {
  Keep: string[];
  Problem: string[];
  Try: string[];
}

export const KPT_PROMPTS = {
  [KptPhase.First]: KPT_KEEP_ONLY_PROMPT,
  [KptPhase.Second]: KPT_FULL_PROMPT,
};

export class KPTAnalyzer {
  constructor(private readonly client: LLMClient) { }

  async analyze(req: KptAnalyzeRequest): Promise<KPTResult> {
    logger.debug('[KPTAnalyzer] start');

    const text = await this.client.complete(
      KPT_PROMPTS[req.phase],
      req.sourceText
    );
    if (!text) throw new Error('LLM応答が空です');

    const parsed = this.parseKptSections(text);

    return this.normalizeByPhase(parsed, req.phase);
  }

  /**
   * YAML 風 KPT セクションを汎用的にパースする
   */
  private parseKptSections(text: string): KPTResult {
    const result: KPTResult = {
      Keep: [],
      Problem: [],
      Try: [],
    };

    const lines = text.split(/\r?\n/);
    let current: keyof KPTResult | null = null;

    for (const line of lines) {
      const t = line.trim();

      if (/^Keep:$/i.test(t)) {
        current = 'Keep';
        continue;
      }
      if (/^Problem:$/i.test(t)) {
        current = 'Problem';
        continue;
      }
      if (/^Try:$/i.test(t)) {
        current = 'Try';
        continue;
      }

      if (current && t.startsWith('-')) {
        const item = t.slice(1).trim();
        if (item) {
          result[current].push(item);
        }
      }
    }

    return result;
  }

  /**
   * フェーズに応じて KPTResult を正規化する
   */
  private normalizeByPhase(
    result: KPTResult,
    phase: KptPhase
  ): KPTResult {
    if (phase === KptPhase.First) {
      return {
        Keep: result.Keep,
        Problem: [],
        Try: [],
      };
    }

    // 2回目以降はフル
    return result;
  }
}
