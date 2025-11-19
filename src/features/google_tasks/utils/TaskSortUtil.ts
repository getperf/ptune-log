import { MyTask } from 'src/core/models/tasks/MyTask';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * タスク並び替え・ツリー構築ユーティリティ
 */
export interface TaskTree {
  parent: MyTask;
  children: MyTask[];
}

/**
 * position順ソート
 */
export function sortByPosition<T extends { position?: string }>(
  a: T,
  b: T
): number {
  return (a.position || '').localeCompare(b.position || '');
}

/**
 * タスク配列から親子ツリー構造を生成
 */
export function buildTaskTree(tasks: MyTask[]): TaskTree[] {
  logger.debug('[TaskSortUtil.buildTaskTree] start');
  const parents: MyTask[] = [];
  const subMap = new Map<string, MyTask[]>();

  for (const task of tasks) {
    if (task.parent) {
      const list = subMap.get(task.parent) ?? [];
      list.push(task);
      subMap.set(task.parent, list);
    } else {
      parents.push(task);
    }
  }

  logger.debug(
    `[TaskSortUtil.buildTaskTree] parents=${parents.length}, childrenKeys=${
      Array.from(subMap.keys()).length
    }`
  );

  const result = parents.map((p) => ({
    parent: p,
    children: subMap.get(p.id) ?? [],
  }));

  logger.debug('[TaskSortUtil.buildTaskTree] done');
  return result;
}
