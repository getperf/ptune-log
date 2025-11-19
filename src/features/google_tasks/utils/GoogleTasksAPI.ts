import { Notice } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTaskList } from 'src/core/models/tasks/MyTaskList';
import { MyTask } from 'src/core/models/tasks/MyTask';
import { MyTaskFactory } from 'src/core/models/tasks/MyTaskFactory';
import { TokenManager } from '../google_auth/TokenManager';

/**
 * Google Tasks API クラス
 * - Google Tasks へのHTTP通信とエラーハンドリングを担当
 */
export class GoogleTasksAPI {
  constructor(private tokenManager: TokenManager) {}

  /**
   * 共通HTTPリクエスト処理
   */
  private async request<T>(
    url: string,
    method = 'GET',
    body?: any
  ): Promise<T | undefined> {
    logger.debug(`[GoogleTasksAPI.request] ${method} ${url}`);
    try {
      const token = await this.tokenManager.getValidAccessToken();
      if (!token) {
        const msg = 'アクセストークンが取得できません';
        new Notice(msg, 8000);
        logger.warn(`[GoogleTasksAPI.request] ${msg}`);
        throw new Error(msg);
      }

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const text = await res.text();
        const msg = `Google Tasks API エラー (${res.status}): ${text}`;
        logger.error(`[GoogleTasksAPI.request] ${msg}`);
        new Notice(msg, 8000);
        throw new Error(msg);
      }

      if (res.status === 204) {
        logger.debug('[GoogleTasksAPI.request] No Content (204)');
        return undefined;
      }

      const data = await res.json();
      logger.debug('[GoogleTasksAPI.request] Response OK');
      return data;
    } catch (e: any) {
      const msg = `Google Tasks API 例外: ${e.message ?? e}`;
      logger.error(`[GoogleTasksAPI.request] ${msg}`);
      new Notice(msg, 8000);
      throw e;
    }
  }

  /**
   * タスクリスト一覧を取得
   */
  async listTaskLists(): Promise<MyTaskList[]> {
    logger.debug('[GoogleTasksAPI.listTaskLists] start');
    const res = await this.request<{ items: MyTaskList[] }>(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists'
    );
    logger.debug('[GoogleTasksAPI.listTaskLists] done');
    return res?.items ?? [];
  }

  /**
   * 新規タスクリスト作成
   */
  async createTaskList(title: string): Promise<MyTaskList> {
    logger.info(`[GoogleTasksAPI.createTaskList] create: ${title}`);
    const result = await this.request<MyTaskList>(
      'https://tasks.googleapis.com/tasks/v1/users/@me/lists',
      'POST',
      { title }
    );
    if (!result) {
      const msg = 'タスクリストの作成に失敗しました';
      logger.error(`[GoogleTasksAPI.createTaskList] ${msg}`);
      new Notice(msg, 8000);
      throw new Error(msg);
    }
    logger.debug('[GoogleTasksAPI.createTaskList] done');
    return result;
  }

  /**
   * タスクリスト名からID検索
   */
  async findTaskListId(title: string): Promise<string | null> {
    logger.debug(`[GoogleTasksAPI.findTaskListId] find title=${title}`);
    const lists = await this.listTaskLists();
    const found = lists.find((l) => l.title === title)?.id ?? null;
    logger.debug(`[GoogleTasksAPI.findTaskListId] result=${found}`);
    return found;
  }

  /**
   * リストIDからタスク一覧取得
   */
  async listTasks(taskListId: string): Promise<MyTask[]> {
    logger.debug(`[GoogleTasksAPI.listTasks] listId=${taskListId}`);
    const params = new URLSearchParams({
      showCompleted: 'true',
      showHidden: 'true',
    });
    const res = await this.request<{ items: any[] }>(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?${params.toString()}`
    );
    const tasks = (res?.items ?? []).map((item) =>
      MyTaskFactory.fromApiData(item, taskListId)
    );
    logger.debug(`[GoogleTasksAPI.listTasks] count=${tasks.length}`);
    return tasks;
  }

  /**
   * タスク追加
   */
  async addTask(task: MyTask, taskListId: string): Promise<MyTask> {
    logger.debug(`[GoogleTasksAPI.addTask] listId=${taskListId}`);
    const data = await this.request<any>(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
      'POST',
      task.toApiData()
    );
    task.id = data.id;
    return task;
  }

  /**
   * タスク更新
   */
  async updateTask(task: MyTask, taskListId: string): Promise<void> {
    logger.debug(`[GoogleTasksAPI.updateTask] id=${task.id}`);
    await this.request(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${task.id}`,
      'PUT',
      task.toApiData()
    );
  }

  /**
   * タスク削除
   */
  async deleteTask(taskId: string, taskListId: string): Promise<void> {
    logger.debug(`[GoogleTasksAPI.deleteTask] id=${taskId}`);
    await this.request(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
      'DELETE'
    );
  }

  /**
   * タスク移動（親・順序変更）
   */
  async moveTask(
    taskId: string,
    taskListId: string,
    parentId?: string,
    previousId?: string
  ): Promise<void> {
    logger.debug(`[GoogleTasksAPI.moveTask] id=${taskId}`);
    const url = new URL(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}/move`
    );
    if (parentId) url.searchParams.set('parent', parentId);
    if (previousId) url.searchParams.set('previous', previousId);
    await this.request(url.toString(), 'POST');
  }
}
