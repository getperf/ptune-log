// File: src/features/google_tasks/services/time_analysis/services/TaskTimeAggregator.ts

import { MyTask } from 'src/core/models/tasks/MyTask';
import { TaskExecutionEntry } from '../models/TaskExecutionEntry';
import { TimeReport } from '../models/TimeReport';
import { TaskKeyGenerator } from 'src/core/services/tasks/TaskKeyGenerator';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { logger } from 'src/core/services/logger/loggerInstance';

/** 内部用：階層ノード */
interface TaskNode {
  task: MyTask;
  children: TaskNode[];
}

/** 内部用：pomodoro 合計（計算専用） */
interface PomodoroSum {
  planned: number;
  actual: number;
}

/** 出力用 pomodoro（0 は含めない） */
interface PomodoroOutput {
  planned?: number;
  actual?: number;
  delta?: number;
}

export class TaskTimeAggregator {
  aggregate(tasks: MyTask[], date: Date): TimeReport {
    const tree = this.buildHierarchy(tasks.filter((t) => !t.deleted));
    const out = new Map<string, TaskExecutionEntry>();

    const roots = tree.slice().sort((a, b) => this.sortNode(a, b));
    for (const root of roots) {
      this.walkTree(root, undefined, out);
    }

    return new TimeReport(DateUtil.localDate(date), 'task_execution', out);
  }

  // --- 親子階層構築
  private buildHierarchy(tasks: MyTask[]): TaskNode[] {
    const map = new Map<string, TaskNode>();
    tasks.forEach((t) => map.set(t.id, { task: t, children: [] }));

    const roots: TaskNode[] = [];
    for (const task of tasks) {
      const node = map.get(task.id);
      if (!node) continue;

      if (task.parent) {
        const parent = map.get(task.parent);
        parent ? parent.children.push(node) : roots.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  // --- ノードソート（started → title）
  private sortNode(a: TaskNode, b: TaskNode): number {
    const aKey = a.task.started?.trim() || '9999-12-31T23:59:59Z';
    const bKey = b.task.started?.trim() || '9999-12-31T23:59:59Z';
    const cmp = aKey.localeCompare(bKey);
    return cmp !== 0 ? cmp : a.task.title.localeCompare(b.task.title);
  }

  /**
   * DFS 走査
   * - 子→親へ pomodoro をロールアップ
   * - actual=0 は出力しない
   * - delta は actual>0 のみ
   */
  private walkTree(
    node: TaskNode,
    parentTaskKey: string | undefined,
    out: Map<string, TaskExecutionEntry>
  ): PomodoroSum {
    const t = node.task;

    // --- 自身の pomodoro（計算用）
    let sum: PomodoroSum = {
      planned: t.pomodoro?.planned ?? 0,
      actual: t.pomodoro?.actual ?? 0,
    };

    const selfKey = parentTaskKey
      ? `${parentTaskKey}__${TaskKeyGenerator.normalize(t.title)}`
      : TaskKeyGenerator.normalize(t.title);

    // --- 子ノード集計
    const children = node.children.slice().sort((a, b) => this.sortNode(a, b));
    for (const child of children) {
      const childSum = this.walkTree(child, selfKey, out);
      sum.planned += childSum.planned;
      sum.actual += childSum.actual;
    }

    // --- 出力用 pomodoro 正規化
    const pomodoro = this.normalizePomodoro(sum);

    if (out.has(selfKey)) {
      logger.warn(
        `[TaskTimeAggregator] duplicate taskKey: ${selfKey} (overwrite)`
      );
    }

    out.set(
      selfKey,
      new TaskExecutionEntry(
        selfKey,
        t.id,
        t.title,
        t.status ?? 'needsAction',
        parentTaskKey,
        pomodoro,
        t.started,
        t.completed
      )
    );

    return sum;
  }

  // --- 出力仕様を1か所に集約
  private normalizePomodoro(sum: PomodoroSum): PomodoroOutput | undefined {
    const hasPlanned = sum.planned > 0;
    const hasActual = sum.actual > 0;

    if (!hasPlanned && !hasActual) {
      return undefined;
    }

    const out: PomodoroOutput = {};

    if (hasPlanned) {
      out.planned = sum.planned;
    }

    if (hasActual) {
      out.actual = sum.actual;
      out.delta = sum.actual - (sum.planned ?? 0);
    }

    return out;
  }
}
