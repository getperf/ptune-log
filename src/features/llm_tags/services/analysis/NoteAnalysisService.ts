/**
 * NoteAnalysisService
 * - CommonTagAnalyzer / KPTAnalyzer を順番に実行する統合クラス。
 * - UI 反映は IProgressReporter に委譲（今回は終了のみ通知）。
 */
import { App } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { IAnalyzer } from './IAnalyzer';
import { CommonTagAnalyzer } from './CommonTagAnalyzer';
import { KPTAnalyzer } from './KPTAnalyzer';
import { IProgressReporter } from '../llm/IProgressReporter';

interface AnalyzeOptions {
  force?: boolean;
}

export class NoteAnalysisService {
  private analyzers: { name: string; impl: IAnalyzer }[];

  constructor(app: App, llmClient: LLMClient) {
    this.analyzers = [
      { name: '共通タグ生成', impl: new CommonTagAnalyzer(app, llmClient) },
      { name: 'KPT分析', impl: new KPTAnalyzer(llmClient) },
    ];
  }

  /**
   * analyze
   * - NoteSummaries に対し、全 Analyzer を実行する。
   * - 各フェーズの終了時に reporter.onPhaseDone(name) を通知。
   */
  async analyze(
    summaries: NoteSummaries,
    options: AnalyzeOptions = {},
    reporter?: IProgressReporter
  ): Promise<NoteSummaries> {
    logger.debug(
      `[NoteAnalysisService.analyze] start force=${options.force ?? false}`
    );

    for (const a of this.analyzers) {
      logger.debug(`[NoteAnalysisService] run analyzer=${a.name}`);
      await a.impl.analyze(summaries, options);
      logger.debug(`[NoteAnalysisService] complete analyzer=${a.name}`);

      // UIにフェーズ完了通知
      reporter?.onPhaseDone(a.name);
    }

    logger.debug('[NoteAnalysisService.analyze] complete');
    return summaries;
  }
}
