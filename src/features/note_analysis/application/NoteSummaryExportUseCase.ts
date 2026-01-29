// src/features/note_analysis/application/NoteSummaryExportUseCase.ts

import { App, Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { DailyNoteLoader } from 'src/core/services/daily_notes/file_io/DailyNoteLoader';
import { i18n } from 'src/i18n';

import { buildNoteSummaryExportPrompt } from '../services/note_summary_prompt';
import { NoteSummaryResultApplier } from '../services/NoteSummaryResultApplier';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';

/**
 * NoteSummaryExportUseCase
 * - reviewMemo を入力に LLM で「構造整理」だけを実行
 * - 結果を KPT セクションに素材として反映
 */
export class NoteSummaryExportUseCase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
  ) {}

  async run(): Promise<void> {
    const ui = i18n.ui.noteAnalysis;

    logger.info('[NoteSummaryExportUseCase] run: start');

    const dailyNote = await DailyNoteLoader.loadFromActive(this.app);
    if (!dailyNote) {
      logger.warn('[NoteSummaryExportUseCase] no active daily note');
      new Notice(ui.modal.message.noDailyNote);
      return;
    }

    // 1. 入力抽出（reviewMemo）
    const userPrompt = this.extractReviewMemo(dailyNote);
    if (!userPrompt) {
      logger.debug('[NoteSummaryExportUseCase] reviewMemo is empty');
      return;
    }

    // 2. プロンプト構築
    const systemPrompt = buildNoteSummaryExportPrompt();

    // 3. LLM 実行
    let result: string;
    try {
      logger.info('[NoteSummaryExportUseCase] llm: execute');
      const output = await this.llmClient.complete(systemPrompt, userPrompt);
      if (!output) {
        throw new Error('Note summary export result is empty');
      }
      result = output;
      logger.info('[NoteSummaryExportUseCase] llm: success', {
        resultLen: result.length,
      });
    } catch (e) {
      logger.error('[NoteSummaryExportUseCase] llm: failed', e);
      new Notice(ui.modal.message.llmFailed);
      return;
    }

    // 4. 結果反映（素材として追記）
    try {
      const applier = new NoteSummaryResultApplier(this.app);
      await applier.apply(dailyNote, result);
    } catch (e) {
      logger.error('[NoteSummaryExportUseCase] apply failed', e);
      throw e;
    }

    logger.info('[NoteSummaryExportUseCase] apply: completed');
    new Notice(ui.modal.message.updated);
  }

  private extractReviewMemo(dailyNote: DailyNote): string {
    return dailyNote.reviewedNote.getRawLines().join('\n');
  }
}
