// src/features/note_analysis/application/KptAnalysisUseCase.ts

import { App, Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { DailyNoteLoader } from 'src/core/services/daily_notes/file_io/DailyNoteLoader';
import { i18n } from 'src/i18n';

import { KptSourceExtractor } from '../services/KptSourceExtractor';
import { KptPromptBuilder } from '../services/KptPromptBuilder';
import { KptResultApplier } from '../services/KptResultApplier';

export class KptAnalysisUseCase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) {}

  async run(): Promise<void> {
    const ui = i18n.ui.noteAnalysis;

    logger.info('[KptAnalysisUseCase] run: start');

    const dailyNote = await DailyNoteLoader.loadFromActive(this.app);
    if (!dailyNote) {
      logger.warn('[KptAnalysisUseCase] run: no active daily note');
      // i18n置換：「デイリーノートを開いてから実行してください」
      new Notice(ui.modal.message.noDailyNote);
      return;
    }

    logger.debug('[KptAnalysisUseCase] daily note loaded', {
      date: dailyNote.date,
    });

    // 1. 入力データ抽出
    const source = new KptSourceExtractor().extract(dailyNote);
    logger.debug('[KptAnalysisUseCase] source extracted', {
      taskLen: source.taskReviewSummary.length,
      noteLen: source.noteReviewSummary.length,
    });

    // 2. プロンプト構築
    const { system, user } = KptPromptBuilder.build(source);

    // 3. LLM 実行
    let result: string;
    try {
      logger.info('[KptAnalysisUseCase] llm: execute');
      const output = await this.llmClient.complete(system, user);
      if (!output) {
        throw new Error('KPT result is empty');
      }
      result = output;
      logger.info('[KptAnalysisUseCase] llm: success', {
        resultLen: result.length,
      });
    } catch (e) {
      logger.error('[KptAnalysisUseCase] llm: failed', e);
      // i18n置換：「KPT分析の実行に失敗しました」
      new Notice(ui.modal.message.llmFailed);
      return;
    }

    // 4. 結果反映
    await new KptResultApplier(this.app).apply(dailyNote, result);
    logger.info('[KptAnalysisUseCase] apply: completed');

    // i18n置換：「KPT分析を更新しました」
    new Notice(ui.modal.message.updated);
  }
}
