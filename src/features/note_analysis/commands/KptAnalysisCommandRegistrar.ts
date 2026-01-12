// File: src/features/note_analysis/commands/KptAnalysisCommandRegistrar.ts

import { App, Plugin, Notice } from 'obsidian';
import { KptAnalysisUseCase } from '../application/KptAnalysisUseCase';

export class KptAnalysisCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly useCase: KptAnalysisUseCase
  ) {}

  register(plugin: Plugin): void {
    plugin.addCommand({
      id: 'kpt-analysis-run',
      name: 'KPT分析（レビュー反映）を実行',
      callback: async () => {
        await this.useCase.run();
      },
    });
  }
}
