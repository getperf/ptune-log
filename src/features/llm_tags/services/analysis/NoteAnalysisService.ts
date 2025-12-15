// File: src/features/llm_tags/services/analysis/NoteAnalysisService.ts
import { App, TFile } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';

import {
  CommonTagAnalyzer,
  CommonTagAnalyzerOptions,
} from './CommonTagAnalyzer';
import { KPTAnalyzer } from './KPTAnalyzer';
import { KPTExecutor } from './KPTExecutor';

export interface NoteAnalysisServiceOptions {
  enableCommonTag?: boolean;
  forceCommonTags?: boolean;
}

export class NoteAnalysisService {
  private readonly commonTagAnalyzer: CommonTagAnalyzer;
  private readonly kptExecutor: KPTExecutor;

  constructor(app: App, llmClient: LLMClient) {
    this.commonTagAnalyzer = new CommonTagAnalyzer(app, llmClient);
    this.kptExecutor = new KPTExecutor(new KPTAnalyzer(llmClient));
  }

  async analyze(
    summaries: NoteSummaries,
    dailyNoteText: string,
    options: NoteAnalysisServiceOptions = {}
  ): Promise<NoteSummaries> {
    logger.debug('[NoteAnalysisService.analyze] start');

    const commonOpts: CommonTagAnalyzerOptions = {
      enableCommonTag: options.enableCommonTag ?? true,
      forceCommonTags: options.forceCommonTags ?? false,
    };

    await this.commonTagAnalyzer.analyze(summaries, commonOpts);

    await this.kptExecutor.run({
      summaries,
      dailyNoteText,
    });

    logger.debug('[NoteAnalysisService.analyze] complete');
    return summaries;
  }
}
