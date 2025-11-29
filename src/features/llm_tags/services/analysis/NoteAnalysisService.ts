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
import {
  CommonTagAnalyzer,
  CommonTagAnalyzerOptions,
} from './CommonTagAnalyzer';
import { KPTAnalyzer } from './KPTAnalyzer';
import { IProgressReporter } from '../llm/IProgressReporter';

export interface NoteAnalysisServiceOptions {
  /** 共通タグを既存に関係なく再生成する */
  forceCommonTags?: boolean;
}

export class NoteAnalysisService {
  /**
   * Analyzer の一覧
   * - 各 Analyzer ごとに Options を個別に型定義
   */
  private analyzers: {
    name: string;
    impl: IAnalyzer<any>;
    applyOptions: (global: NoteAnalysisServiceOptions) => any;
  }[];

  constructor(app: App, llmClient: LLMClient) {
    this.analyzers = [
      {
        name: '共通タグ生成',
        impl: new CommonTagAnalyzer(app, llmClient),
        applyOptions: (
          global: NoteAnalysisServiceOptions
        ): CommonTagAnalyzerOptions => ({
          force: global.forceCommonTags ?? false,
        }),
      },
      {
        name: 'KPT分析',
        impl: new KPTAnalyzer(llmClient),
        applyOptions: () => ({}),
      },
    ];
  }

  /**
   * analyze
   * - NoteSummaries に対し、全 Analyzer を実行する。
   * - 各フェーズごとに reporter.onPhaseDone を通知。
   */
  async analyze(
    summaries: NoteSummaries,
    options: NoteAnalysisServiceOptions = {},
    reporter?: IProgressReporter
  ): Promise<NoteSummaries> {
    logger.debug(
      `[NoteAnalysisService.analyze] start options=${JSON.stringify(options)}`
    );

    for (const a of this.analyzers) {
      logger.debug(`[NoteAnalysisService] run analyzer=${a.name}`);

      const analyzerOptions = a.applyOptions(options);
      await a.impl.analyze(summaries, analyzerOptions);

      logger.debug(`[NoteAnalysisService] complete analyzer=${a.name}`);
      reporter?.onPhaseDone(a.name);
    }

    logger.debug('[NoteAnalysisService.analyze] complete');
    return summaries;
  }
}
