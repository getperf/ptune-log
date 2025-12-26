// File: src/features/google_tasks/services/time_analysis/services/LLMTimeAnalysisService.ts

import { App, normalizePath } from 'obsidian';
import { TimeAnalysisPromptBuilder } from '../llm/TimeAnalysisPromptBuilder';
import { TimeAnalysisResultWriter } from './TimeAnalysisResultWriter';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';

export class LLMTimeAnalysisService {
  private readonly promptBuilder = new TimeAnalysisPromptBuilder();
  private readonly resultWriter: TimeAnalysisResultWriter;

  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) {
    this.resultWriter = new TimeAnalysisResultWriter(app);
  }

  async analyzeFromYamlFile(yamlPath: string): Promise<void> {
    const adapter = this.app.vault.adapter;
    const path = normalizePath(yamlPath);

    logger.info(`[LLMTimeAnalysisService] load yaml: ${path}`);
    const yamlText = await adapter.read(path);

    // --- system / user を明確に分離
    const systemPrompt = 'あなたは作業ログを要約するアシスタントです。';

    const userPrompt = this.promptBuilder.buildUserPrompt(yamlText);

    logger.debug('[LLMTimeAnalysisService] user prompt built');
    logger.debug(userPrompt);

    const result = await this.llmClient.complete(systemPrompt, userPrompt);

    if (!result) {
      logger.warn('[LLMTimeAnalysisService] LLM returned null');
      return;
    }

    // --- result は string
    this.resultWriter.debugOutput(result);
  }
}
