// File: src/features/llm_tags/services/analysis/KPTExecutor.ts
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { KPTAnalyzer, KPTResult } from './KPTAnalyzer';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';

export interface KPTExecutionContext {
  summaries: NoteSummaries;
  dailyNote: DailyNote;
}

export class KPTExecutor {
  constructor(private readonly analyzer: KPTAnalyzer) {}

  async run(ctx: KPTExecutionContext): Promise<void> {
    const { summaries, dailyNote } = ctx;

    const hasKpt = dailyNote.hasKpt();

    const sourceText = hasKpt
      ? dailyNote.buildKptSourceText()
      : summaries.summaryMarkdown({ baseHeadingLevel: 2, withLink: false });

    logger.debug(`[KPTExecutor] source=${hasKpt ? 'daily-note' : 'summaries'}`);
    logger.debug(sourceText);
    const result: KPTResult = await this.analyzer.analyzeFromText(sourceText);

    summaries.setKptResult(result);
  }

  /** KPT セクションの存在判定 */
  private hasKptSection(text: string): boolean {
    return /### 🧠 KPT分析/.test(text);
  }

  /** デイリーノートのサマリセクション抽出 */
  private extractSummarySection(text: string): string {
    const start = text.match(/### 🏷 デイリーレポート[\s\S]*?\n/);
    if (!start) return '';

    const startIdx = start.index ?? 0;
    const rest = text.slice(startIdx);

    const endIdx = rest.search(/\n### (?!🏷 デイリーレポート)/);
    return endIdx === -1 ? rest.trim() : rest.slice(0, endIdx).trim();
  }
}
