// File: src/features/llm_tags/services/analysis/KPTAnalyzer.ts
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { KPT_KEEP_ONLY_PROMPT } from '../../templates/kpt_template';

export interface KPTResult {
  Keep: string[];
  Problem: string[];
  Try: string[];
}

export class KPTAnalyzer {
  constructor(private readonly client: LLMClient) {}

  async analyzeFromText(sourceMarkdown: string): Promise<KPTResult> {
    logger.debug('[KPTAnalyzer] start');

    const text = await this.client.complete(
      KPT_KEEP_ONLY_PROMPT,
      sourceMarkdown
    );
    if (!text) throw new Error('LLM応答が空です');

    return {
      Keep: this.parseKeepOnly(text),
      Problem: [],
      Try: [],
    };
  }

  private parseKeepOnly(text: string): string[] {
    const lines = text.split(/\r?\n/);
    const result: string[] = [];
    let inKeep = false;

    for (const line of lines) {
      const t = line.trim();
      if (/^Keep:$/i.test(t)) {
        inKeep = true;
        continue;
      }
      if (/^(Problem:|Try:)/i.test(t)) {
        inKeep = false;
        continue;
      }
      if (inKeep && t.startsWith('-')) {
        const item = t.slice(1).trim();
        if (item) result.push(item);
      }
    }
    return result;
  }
}
