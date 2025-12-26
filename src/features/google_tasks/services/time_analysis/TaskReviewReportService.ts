// File: src/features/google_tasks/services/review/TaskReviewReportService.ts

import { App } from 'obsidian';
import { TaskExecutionLoader } from '../time_analysis/services/TaskExecutionLoader';
import { TaskTimeAggregator } from '../time_analysis/services/TaskTimeAggregator';
import { TimeReportYamlWriter } from '../time_analysis/services/TimeReportYamlWriter';
import { TaskNoteRelationService } from '../time_analysis/services/TaskNoteRelationService';
import { LLMTimeAnalysisService } from '../time_analysis/services/LLMTimeAnalysisService';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';

export interface TaskReviewOptions {
  attachNotes?: boolean;
  enableLLMAnalysis?: boolean;
  updateDailyNote?: boolean; // 将来用
}

export class TaskReviewReportService {
  private readonly loader: TaskExecutionLoader;
  private readonly aggregator: TaskTimeAggregator;
  private readonly writer: TimeReportYamlWriter;
  private readonly noteRelation: TaskNoteRelationService;
  private readonly llmAnalysis?: LLMTimeAnalysisService;

  constructor(private readonly app: App, llmClient?: LLMClient) {
    this.loader = new TaskExecutionLoader(app);
    this.aggregator = new TaskTimeAggregator();
    this.writer = new TimeReportYamlWriter(app);
    this.noteRelation = new TaskNoteRelationService(app);

    if (llmClient) {
      this.llmAnalysis = new LLMTimeAnalysisService(app, llmClient);
    }
  }

  /**
   * 日次タスク振り返りレポート生成
   */
  async generate(date: Date, options: TaskReviewOptions): Promise<void> {
    logger.info(`[TaskReviewReportService] start date=${date.toISOString()}`);

    // ① タスク実績ロード
    const tasks = await this.loader.load(date);

    // ② 時間集約
    const report = this.aggregator.aggregate(tasks, date);

    // ③ ノート関連付け（任意）
    if (options.attachNotes) {
      await this.noteRelation.attachRelatedNotes(report, date);
    }

    // ④ YAML 保存
    const yamlPath = await this.writer.write(report);

    // ⑤ LLM 時間分析（任意）
    if (options.enableLLMAnalysis && this.llmAnalysis) {
      await this.llmAnalysis.analyzeFromYamlFile(yamlPath);
    }

    // ⑥ デイリーノート更新（今回は未実装）
    if (options.updateDailyNote) {
      logger.debug(
        '[TaskReviewReportService] daily note update skipped (skeleton)'
      );
    }

    logger.info('[TaskReviewReportService] done');
  }
}
