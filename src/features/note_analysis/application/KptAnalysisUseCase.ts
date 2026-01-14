// src/features/note_analysis/application/KptAnalysisUseCase.ts

import { App, Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { DailyNoteLoader } from 'src/core/services/daily_notes/file_io/DailyNoteLoader';

import { KptSourceExtractor } from '../services/KptSourceExtractor';
import { KptPromptBuilder } from '../services/KptPromptBuilder';
import { KptResultApplier } from '../services/KptResultApplier';

export class KptAnalysisUseCase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) { }

  async run(): Promise<void> {
    const dailyNote = await DailyNoteLoader.loadFromActive(this.app);

    if (!dailyNote) {
      new Notice('デイリーノートを開いてから実行してください');
      return;
    }

    // 1. 入力データ抽出
    const source = new KptSourceExtractor().extract(dailyNote);

    // 2. プロンプト構築（system / user 分離）
    const { system, user } = KptPromptBuilder.build(source);
    logger.debug('[KPT][Prompt Preview]');
    logger.debug(user);

    // 3. LLM 実行
    let result: string | null = null;
    try {
      result = await this.llmClient.complete(system, user);
      if (!result) {
        throw new Error('KPT分析結果が空でした');
      }
    } catch (e) {
      logger.error('[KPT] LLM execution failed', e);
      new Notice('KPT分析の実行に失敗しました');
      return;
    }

    // 4. 結果反映（dailyNote.kpts に追加 & 保存）
    await new KptResultApplier(this.app).apply(dailyNote, result);

    new Notice('KPT分析を更新しました');
  }
}
