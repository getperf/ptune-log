// src/features/note_analysis/commands/KptAnalysisCommandRegistrar.ts

import { App, Plugin } from 'obsidian';
import { i18n } from 'src/i18n';
import { KptAnalysisUseCase } from '../application/KptAnalysisUseCase';

export class KptAnalysisCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly useCase: KptAnalysisUseCase
  ) {}

  register(plugin: Plugin): void {
    plugin.addCommand({
      id: 'kpt-analysis-run',
      // i18n置換：「KPT分析（レビュー反映）を実行」
      name: i18n.ui.noteAnalysis.command.runKpt,
      callback: async () => {
        await this.useCase.run();
      },
    });
  }
}
