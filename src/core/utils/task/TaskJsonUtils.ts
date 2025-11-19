// File: src/core/utils/file/TaskJsonUtils.ts
import { App, normalizePath } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTask } from 'src/core/models/tasks/MyTask';
import { MyTaskFactory } from 'src/core/models/tasks/MyTaskFactory';
import { DateUtil } from 'src/core/utils/date/DateUtil';

/**
 * タスクJSONユーティリティ
 * 保存・読込・フィルタ・変換などの共通処理を担当
 * 保存先: {vault}/_journal/meta/tasks_YYYY-MM-DD.json
 */
export class TaskJsonUtils {
  static readonly BASE_DIR = '_journal/meta';

  constructor(private app: App) {}

  /** JSONファイルへ保存 */
  async save(tasks: MyTask[], date: Date): Promise<string> {
    const fileName = `tasks_${DateUtil.localDate(date)}.json`;
    const path = normalizePath(`${TaskJsonUtils.BASE_DIR}/${fileName}`);

    const payload = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      parent: t.parent ?? null,
      pomodoro: {
        planned: t.pomodoro?.planned ?? null,
        actual: t.pomodoro?.actual ?? null,
      },
      status: t.status ?? 'needsAction',
      note: t.note ?? null,
      completed: t.completed ?? null,
      started: t.started ?? null,
    }));

    const adapter = this.app.vault.adapter;
    if (!(await adapter.exists(TaskJsonUtils.BASE_DIR))) {
      await adapter.mkdir(TaskJsonUtils.BASE_DIR);
      logger.debug(`[TaskJsonUtils] created dir: ${TaskJsonUtils.BASE_DIR}`);
    }

    await adapter.write(path, JSON.stringify(payload, null, 2));
    logger.info(`[TaskJsonUtils] saved ${tasks.length} tasks -> ${path}`);
    return path;
  }

  /** 指定日のタスクJSONを読み込み（存在しない場合は空配列） */
  async load(date: Date): Promise<MyTask[]> {
    const fileName = `tasks_${DateUtil.localDate(date)}.json`;
    const path = normalizePath(`${TaskJsonUtils.BASE_DIR}/${fileName}`);
    const adapter = this.app.vault.adapter;

    if (!(await adapter.exists(path))) {
      logger.warn(`[TaskJsonUtils] file not found: ${path}`);
      return [];
    }

    const jsonText = await adapter.read(path);
    const raw = JSON.parse(jsonText);
    const tasks = raw.map((t: any) =>
      MyTaskFactory.fromApiData(t, t.tasklist_id ?? 'Today')
    );

    logger.info(`[TaskJsonUtils] loaded ${tasks.length} tasks from ${path}`);
    return tasks;
  }

  /** 最近n日分のファイルを読み込む（将来の分析用） */
  async loadRecent(days: number): Promise<MyTask[]> {
    const allTasks: MyTask[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const tasks = await this.load(date);
      allTasks.push(...tasks);
    }
    return allTasks;
  }
}
