// File: src/features/google_tasks/services/time_analysis/services/TimeAnalysisResultWriter.ts

import { App } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

export class TimeAnalysisResultWriter {
  constructor(private readonly app: App) {}

  /**
   * スケルトン実装
   * - 現時点では保存せず debug 出力のみ
   */
  debugOutput(markdown: string): void {
    logger.info('[TimeAnalysisResultWriter] LLM analysis result (preview)');
    logger.info('----------------------------------------');
    logger.info(markdown);
    logger.info('----------------------------------------');
  }
}
