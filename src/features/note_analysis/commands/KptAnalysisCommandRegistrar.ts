// src/features/note_analysis/commands/KptAnalysisCommandRegistrar.ts

import { App, Plugin } from 'obsidian';
import { i18n } from 'src/i18n';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';

import { KptAnalysisUseCase } from '../application/KptAnalysisUseCase';
import { NoteSummaryExportUseCase } from '../application/NoteSummaryExportUseCase';
import { KptSortableModal, SAMPLE_DATA } from '../services/KptSortableSandbox';

/* ★ 検証用モーダルを追加 */

export class KptAnalysisCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
    private readonly reviewSettings: ReviewSettings,
  ) {}

  register(plugin: Plugin): void {
    /* =========================
     * 既存：KPT分析（現行）
     * ========================= */
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

    /* =========================
     * 追加：KPT編集（SortableJS 検証）
     * ========================= */
    plugin.addCommand({
      id: 'kpt-edit-sortable-sandbox',
      name: 'KPT編集（SortableJS 検証）',
      callback: () => {
        new KptSortableModal(this.app, SAMPLE_DATA).open();
      },
    });
  }
}
