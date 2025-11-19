import { MyTask } from 'src/core/models/tasks/MyTask';

/**
 * タスク階層を表すノード構造
 * - MyTask: 実体
 * - children: 子ノード
 */
export interface TaskTree {
  task: MyTask;
  children: TaskTree[];
}
