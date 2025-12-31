// File: src/features/google_tasks/services/time_analysis/TaskReviewReportService.ts

import { Plugin } from 'obsidian';
import { GoogleTasksCommandUtil } from '../../utils/GoogleTasksCommandUtil';
import { GoogleTasksAPI } from '../../utils/GoogleTasksAPI';
import type { GoogleAuthSettings } from 'src/config/ConfigManager';
import { LLMClient } from 'src/core/services/llm/LLMClient';

import { TaskExecutionLoader } from '../time_analysis/services/TaskExecutionLoader';
import { TaskTimeAggregator } from '../time_analysis/services/TaskTimeAggregator';
import { TimeReportYamlWriter } from '../time_analysis/services/TimeReportYamlWriter';
import { LLMTimeAnalysisService } from '../time_analysis/services/LLMTimeAnalysisService';

import { WinTaskImportSource } from '../import/WinTaskImportSource';
import { ApiTaskImportSource } from '../import/ApiTaskImportSource';
import { TimeAnalysisReportWriter } from '../report/TimeAnalysisReportWriter';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';
import { HEADER_TIME_LOG } from '../report/TimeAnalysisDailyNote';
import { TaskNoteRelationService } from './services/TaskNoteRelationService';
import { MyTask } from 'src/core/models/tasks/MyTask';
import { TaskJsonUtils } from 'src/core/utils/task/TaskJsonUtils';

export type TaskReviewStatus =
  | 'idle'
  | 'importing'
  | 'loading'
  | 'aggregating'
  | 'attaching-notes'
  | 'writing'
  | 'llm-analyzing'
  | 'completed'
  | 'error';

export interface TaskReviewStatusListener {
  onStatusChange(status: TaskReviewStatus, message?: string): void;
}

export interface TaskReviewOptions {
  enableImport?: boolean;
  enableLLMAnalysis?: boolean;
  statusListener?: TaskReviewStatusListener;
}

export class TaskReviewReportService {
  private readonly app = this.plugin.app;

  private readonly loader = new TaskExecutionLoader(this.app);
  private readonly aggregator = new TaskTimeAggregator();
  private readonly writer = new TimeReportYamlWriter(this.app);
  private readonly noteRelation = new TaskNoteRelationService(this.app);
  private readonly llmAnalysis?: LLMTimeAnalysisService;

  constructor(
    private readonly plugin: Plugin,
    private readonly settings: GoogleAuthSettings,
    llmClient?: LLMClient
  ) {
    if (llmClient) {
      this.llmAnalysis = new LLMTimeAnalysisService(this.app, llmClient);
    }
  }

  /** GoogleTasks API 実行を Service 内に集約 */
  private async withApi(
    fn: (api: GoogleTasksAPI) => Promise<void>
  ): Promise<void> {
    return GoogleTasksCommandUtil.wrap(
      this.plugin,
      this.settings,
      fn
    )();
  }

  /** 振り返り実行（単一入口） */
  async generate(date: Date, options: TaskReviewOptions): Promise<void> {
    const notify = options.statusListener?.onStatusChange;

    // --- 当日のみインポート ---
    let tasks: MyTask[] = [];

    if (this.settings.useWinApp) {
      const source = new WinTaskImportSource(this.app);
      tasks = await source.loadTasks();
    } else {
      await this.withApi(async (api) => {
        const source = new ApiTaskImportSource(api);
        tasks = await source.loadTasks();
      });
    }
    const saver = new TaskJsonUtils(this.app);
    await saver.save(tasks, date);

    // --- 時間分析 ---
    notify?.('loading', 'タスク実績を読み込み中');
    const execTasks = await this.loader.load(date);

    notify?.('aggregating', '時間を集計中');
    const report = this.aggregator.aggregate(execTasks, date);
    await this.noteRelation.attachRelatedNotes(report, date);

    // --- YAML 保存（事実ログ） ---
    notify?.('writing', 'YAML を書き込み中');
    const yamlPath = await this.writer.write(report);

    // --- LLM 分析（任意） ---
    let llmResult: string | null = null;
    if (options.enableLLMAnalysis && this.llmAnalysis) {
      notify?.('llm-analyzing', 'LLM による時間分析中');
      llmResult = await this.llmAnalysis.analyzeFromYamlFile(yamlPath);
    }

    // --- 表＋LLM 統合レポート ---
    notify?.('writing', 'レポートを書き込み中');
    const reportWriter = new TimeAnalysisReportWriter();
    const markdown = reportWriter.write(report, llmResult);

    // ★ デイリーノートへ追記（backlog 廃止）
    await DailyNoteHelper.appendToSectionInDailyNote(
      this.app,
      new Date(report.date),
      HEADER_TIME_LOG,
      markdown
    );

    notify?.('completed', '完了');
  }
}
