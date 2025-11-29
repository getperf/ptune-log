import { App, Notice } from 'obsidian';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTask } from 'src/core/models/tasks/MyTask';
import { TaskJsonUtils } from 'src/core/utils/task/TaskJsonUtils';

export const HEADER_TIME_LOG = '## 🕒 タイムログ／メモ';

export interface TaskSummaryReportOptions {
  includeBacklog: boolean;
  targetDate: Date;
}

/** TaskTree：階層＋外部メタ情報(order) を保持 */
export interface TaskTree {
  task: MyTask;
  children: TaskTree[];
  order: number;
}

export class TaskSummaryReportBuilder {
  constructor(
    private app: App,
    private orderMap: Map<string, number> = new Map()
  ) {}

  static createProgressHeader(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `## タスク振り返り (${yyyy}-${mm}-${dd})`;
  }

  async buildFromMyTasks(tasks: MyTask[]): Promise<void> {
    logger.info('[TaskSummaryReportBuilder.buildFromMyTasks] start');

    if (!tasks || tasks.length === 0) {
      new Notice('分析対象のタスクがありません');
      return;
    }

    tasks.forEach((t, i) => {
      logger.debug(
        `[TaskSummaryReportBuilder] input[${i}] id=${t.id} parent=${
          t.parent ?? 'none'
        } status=${t.status} started=${t.started ?? ''} title=${t.title}`
      );
    });

    const tree = this.buildHierarchy(tasks.filter((t) => !t.deleted));

    const date = new Date();
    const heading = TaskSummaryReportBuilder.createProgressHeader(date);

    const table = this.buildTaskTableFromTree(tree);
    const backlog = this.buildBacklogSectionFromTree(tree);

    const content = [heading, table, backlog].filter(Boolean).join('\n\n');

    await DailyNoteHelper.appendToSectionInDailyNote(
      this.app,
      date,
      HEADER_TIME_LOG,
      content
    );

    const exporter = new TaskJsonUtils(this.app);
    await exporter.save(tasks, date);

    new Notice(`✅ ${tasks.length} 件のタスクをデイリーノートへ追記しました`);
    logger.info('[TaskSummaryReportBuilder.buildFromMyTasks] completed');
  }

  private buildHierarchy(tasks: MyTask[]): TaskTree[] {
    const map = new Map<string, TaskTree>();

    tasks.forEach((t) => {
      const order = this.orderMap.get(t.id) ?? Number.MAX_SAFE_INTEGER;
      map.set(t.id, { task: t, children: [], order });
    });

    const roots: TaskTree[] = [];

    for (const task of tasks) {
      const node = map.get(task.id);
      if (!node) continue;

      if (task.parent) {
        const parent = map.get(task.parent);
        if (parent) parent.children.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private sortNode(a: TaskTree, b: TaskTree): number {
    if (a.order !== b.order) return a.order - b.order;

    const aKey = a.task.started?.trim() || '9999-12-31T23:59:59Z';
    const bKey = b.task.started?.trim() || '9999-12-31T23:59:59Z';

    return aKey.localeCompare(bKey);
  }

  private buildTaskTableFromTree(tree: TaskTree[]): string {
    const header =
      '| 状態 | タイトル | 計画🍅 | 実績✅ | 開始 | 完了 |\n' +
      '|------|------------|--------|--------|--------|--------|';

    const rows: string[] = [];

    const sortedRoots = tree.slice().sort((a, b) => this.sortNode(a, b));

    sortedRoots.forEach((node, i) => {
      logger.debug(
        `[TaskSummaryReportBuilder] root[${i}] order=${node.order} started=${
          node.task.started ?? ''
        } title=${node.task.title}`
      );
    });

    sortedRoots.forEach((root) => this.walkTreeForTable(root, 0, rows));

    return [header, ...rows].join('\n');
  }

  private walkTreeForTable(
    node: TaskTree,
    level: number,
    rows: string[]
  ): void {
    rows.push(this.formatTaskRow(node.task, level));

    const children = node.children.slice().sort((a, b) => this.sortNode(a, b));

    children.forEach((child, i) => {
      logger.debug(
        `[TaskSummaryReportBuilder] child level=${level} idx=${i} order=${
          child.order
        } started=${child.task.started ?? ''} title=${child.task.title}`
      );
    });

    children.forEach((child) => this.walkTreeForTable(child, level + 1, rows));
  }

  private formatTaskRow(task: MyTask, level: number): string {
    const indent = '&nbsp;'.repeat(level * 4);

    const planned = task.pomodoro?.planned ?? '';
    const actual = task.pomodoro?.actual ?? '';
    const start = task.started ? this.toTime(task.started) : '';
    const end = task.completed ? this.toTime(task.completed) : '';
    const status = task.status === 'completed' ? '✅' : '';

    return `| ${status} | ${indent}${task.title} | ${planned} | ${actual} | ${start} | ${end} |`;
  }

  private buildBacklogSectionFromTree(tree: TaskTree[]): string {
    const lines: string[] = [];

    const walk = (node: TaskTree, level: number) => {
      const task = node.task;

      if (task.status !== 'completed') {
        const indent = '  '.repeat(level);
        lines.push(`${indent}- [ ] ${task.title}`);
      }

      node.children
        .slice()
        .sort((a, b) => this.sortNode(a, b))
        .forEach((child) => walk(child, level + 1));
    };

    tree
      .slice()
      .sort((a, b) => this.sortNode(a, b))
      .forEach((root) => walk(root, 0));

    if (lines.length === 0) return '';
    return `### 未完了タスク\n${lines.join('\n')}`;
  }

  private toTime(utc?: string): string {
    if (!utc) return '';
    const d = new Date(utc);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
}
