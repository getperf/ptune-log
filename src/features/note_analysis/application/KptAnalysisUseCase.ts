// File: src/features/note_analysis/application/KptAnalysisUseCase.ts

import { App, Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';

import { KptSourceExtractor } from '../services/KptSourceExtractor';
import { KptPromptBuilder } from '../services/KptPromptBuilder';
import { KptResultApplier } from '../services/KptResultApplier';
import { DailyNoteLoader } from 'src/core/services/daily_notes/file_io/DailyNoteLoader';

export class KptAnalysisUseCase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) {}

  async run(): Promise<void> {
    const dailyNote = await DailyNoteLoader.loadFromActive(this.app);

    if (!dailyNote) {
      new Notice('デイリーノートを開いてから実行してください');
      return;
    }

    const source = new KptSourceExtractor().extract(dailyNote);
    const prompt = KptPromptBuilder.build(source);

    // --- LLM 実行は一旦保留
    // const result = await this.llmClient.complete(system, prompt);

    logger.debug('[KPT][Prompt Preview]');
    logger.debug(prompt);

    await new KptResultApplier(this.app).apply(dailyNote);
  }
}
