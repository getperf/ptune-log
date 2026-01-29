// src/features/note_analysis/commands/KptAnalysisCommandRegistrar.ts

import { App, Plugin } from 'obsidian';
import { i18n } from 'src/i18n';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';

import { KptAnalysisUseCase } from '../application/KptAnalysisUseCase';
import { NoteSummaryExportUseCase } from '../application/NoteSummaryExportUseCase';

export class KptAnalysisCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
    private readonly reviewSettings: ReviewSettings,
  ) {}

  register(plugin: Plugin): void {
    plugin.addCommand({
      id: 'kpt-analysis-run',
      name: i18n.ui.noteAnalysis.command.runKpt,
      callback: async () => {
        // ★ フェーズに応じて切替（現状は NoteSummaryExport）
        const useCase = new NoteSummaryExportUseCase(this.app, this.llmClient);

        // 将来戻す場合：
        // const useCase = new KptAnalysisUseCase(
        //   this.app,
        //   this.llmClient,
        //   this.reviewSettings,
        // );

        await useCase.run();
      },
    });
  }
}
