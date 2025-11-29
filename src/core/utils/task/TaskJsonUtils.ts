// File: src/core/utils/file/TaskJsonUtils.ts
import { App, normalizePath } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTask } from 'src/core/models/tasks/MyTask';
import { MyTaskFactory } from 'src/core/models/tasks/MyTaskFactory';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { GoogleTaskDto } from 'src/core/models/tasks/GoogleTaskDto';

/**
 * JSONファイル内のタスク構造を型で保証
 */
export interface TaskJsonRecord {
  id: string;
  title: string;
  parent: string | null;
  pomodoro: {
    planned: number | null;
    actual: number | null;
  };
  status: 'needsAction' | 'completed';
  note: string | null;
  completed: string | null;
  started: string | null;
  tasklist_id?: string | null;
}

/**
 * タスクJSONユーティリティ
 * 保存・読込・変換・フィルタなどの共通処理
 */
export class TaskJsonUtils {
  static readonly BASE_DIR = '_journal/meta';

  constructor(private app: App) {}

  /** --- JSONファイルへ保存 */
  async save(tasks: MyTask[], date: Date): Promise<string> {
    const fileName = `tasks_${DateUtil.localDate(date)}.json`;
    const path = normalizePath(`${TaskJsonUtils.BASE_DIR}/${fileName}`);

    const payload: TaskJsonRecord[] = tasks.map((t) => ({
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
      tasklist_id: t.tasklist_id ?? null,
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

  /** --- 指定日のタスクJSONを読み込み（存在しない場合は空配列） */
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

    const tasks = raw.map((t: any) => {
      const normalized: GoogleTaskDto = {
        id: t.id ?? undefined,
        title: t.title ?? '',
        parent: t.parent ?? undefined, // ★ null → undefined
        pomodoro: t.pomodoro ?? undefined,
        status: t.status ?? 'needsAction',
        note: t.note ?? undefined,
        completed: t.completed ?? undefined,
        started: t.started ?? undefined,
        due: t.due ?? undefined,
        updated: t.updated ?? undefined,
        deleted: t.deleted ?? false,
      };

      return MyTaskFactory.fromApiData(normalized, t.tasklist_id ?? 'Today');
    });

    logger.info(`[TaskJsonUtils] loaded ${tasks.length} tasks from ${path}`);
    return tasks;
  }

  /** --- 最近n日分のファイルを読み込む（将来の分析用） */
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
