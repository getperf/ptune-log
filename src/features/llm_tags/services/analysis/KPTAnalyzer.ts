/**
 * KPTAnalyzer
 * - ノート全体の要約をまとめて LLM に送り、KPT の Keep 部分を抽出する軽量分析。
 * - Problem / Try は後からユーザーが手入力する方針のため空リストにする。
 */
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { logger } from 'src/core/services/logger/loggerInstance';
import { IAnalyzer } from './IAnalyzer';
import { KPT_KEEP_ONLY_PROMPT } from '../../templates/kpt_template';

export interface KPTResult {
  Keep: string[];
  Problem: string[];
  Try: string[];
}

export class KPTAnalyzer implements IAnalyzer {
  constructor(private readonly client: LLMClient) {}

  /**
   * analyze
   * - Keep パートを LLM で抽出し、NoteSummaries にセット。
   */
  async analyze(summaries: NoteSummaries): Promise<void> {
    logger.debug('[KPTAnalyzer] start');

    const system = KPT_KEEP_ONLY_PROMPT;
    const user = summaries.summaryMarkdown();

    const text = await this.client.complete(system, user);
    if (!text) throw new Error('LLM応答が空です');

    const keep = this.parseKeepOnly(text);

    summaries.setKptResult({
      Keep: keep,
      Problem: [],
      Try: [],
    });

    logger.debug('[KPTAnalyzer] complete');
  }

  /** Keep 部分だけ抽出する軽量パーサ */
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
        if (item.length > 0) result.push(item);
      }
    }

    return result;
  }
}
