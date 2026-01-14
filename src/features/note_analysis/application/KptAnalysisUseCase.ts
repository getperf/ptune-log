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

    const dailyNote = await DailyNoteLoader.loadFromActive(this.app);
    if (!dailyNote) {
      // i18n置換：「デイリーノートを開いてから実行してください」
      new Notice(ui.modal.message.noDailyNote);
      return;
    }

    // 1. 入力データ抽出
    const source = new KptSourceExtractor().extract(dailyNote);

    // 2. プロンプト構築（system / user 分離）
    const { system, user } = KptPromptBuilder.build(source);
    logger.debug('[KPT][Prompt Preview]');
    logger.debug(user);

    // 3. LLM 実行
    let result: string;
    try {
      const output = await this.llmClient.complete(system, user);
      if (!output) {
        throw new Error('KPT result is empty');
      }
      result = output;
    } catch (e) {
      logger.error('[KPT] LLM execution failed', e);
      // i18n置換：「KPT分析の実行に失敗しました」
      new Notice(ui.modal.message.llmFailed);
      return;
    }

    // 4. 結果反映
    await new KptResultApplier(this.app).apply(dailyNote, result);

    // i18n置換：「KPT分析を更新しました」
    new Notice(ui.modal.message.updated);
  }
}
