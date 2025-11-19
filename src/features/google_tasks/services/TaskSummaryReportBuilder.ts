import { App, Notice } from 'obsidian';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';
import { logger } from 'src/core/services/logger/loggerInstance';
import { MyTask } from 'src/core/models/tasks/MyTask';
import { TaskJsonUtils } from 'src/core/utils/task/TaskJsonUtils';

/** 日報セクションの見出し */
export const HEADER_TIME_LOG = '## 🕒 タイムログ／メモ';

export interface TaskSummaryReportOptions {
  includeBacklog: boolean;
  targetDate: Date;
}

/** TaskTree：階層＋外部メタ情報(order) を保持 */
export interface TaskTree {
  task: MyTask;
  children: TaskTree[];
  order: number; // ← 元の parsed.index 等を外部から渡す
}

/**
 * TaskSummaryReportBuilder
 * - MyTask[] → TaskTree[] を構築
 * - 階層付きタスク表とバックログをMarkdown化
 * - デイリーノートへ追記
 */
export class TaskSummaryReportBuilder {
  constructor(
    private app: App,
    private api: any,
    private orderMap: Map<string, number> = new Map() // ← 追加
  ) {}

  /** 見出し生成 */
  static createProgressHeader(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `## タスク振り返り (${yyyy}-${mm}-${dd})`;
  }

  /** MyTask から階層化レポートを生成してデイリーノートに追記 */
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
        } ` + `status=${t.status} started=${t.started ?? ''} title=${t.title}`
      );
    });
    // --- ① TaskTree を構築（orderMap 付き） ---
    const tree = this.buildHierarchy(tasks.filter((t) => !t.deleted));

    const date = new Date();
    const heading = TaskSummaryReportBuilder.createProgressHeader(date);

    // --- ② 階層タスク表 ---
    const table = this.buildTaskTableFromTree(tree);

    // --- ③ 未完了バックログ ---
    const backlog = this.buildBacklogSectionFromTree(tree);

    const content = [heading, table, backlog].filter(Boolean).join('\n\n');

    await DailyNoteHelper.appendToSectionInDailyNote(
      this.app,
      date,
      HEADER_TIME_LOG,
      content
    );

    // JSON 保存
    const exporter = new TaskJsonUtils(this.app);
    await exporter.save(tasks, date);

    new Notice(`✅ ${tasks.length} 件のタスクをデイリーノートへ追記しました`);
    logger.info('[TaskSummaryReportBuilder.buildFromMyTasks] completed');
  }

  /** MyTask[] → TaskTree[] を構築（orderMap を付与） */
  private buildHierarchy(tasks: MyTask[]): TaskTree[] {
    const map = new Map<string, TaskTree>();

    // --- 各タスクに order を付与してノード化 ---
    tasks.forEach((t) => {
      const order = this.orderMap.get(t.id) ?? Number.MAX_SAFE_INTEGER;
      map.set(t.id, { task: t, children: [], order });
    });

    const roots: TaskTree[] = [];

    for (const task of tasks) {
      const node = map.get(task.id);
      if (!node) {
        logger.warn(
          `[TaskSummaryReportBuilder.buildHierarchy] missing node for task id=${task.id}`
        );
        continue;
      }

      if (task.parent) {
        const parent = map.get(task.parent);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  /** order 優先でソートする */
  private sortNode(a: TaskTree, b: TaskTree): number {
    // 1) order を優先
    if (a.order !== b.order) return a.order - b.order;

    // 2) started が空欄の場合は後ろへ
    const aKey =
      a.task.started && a.task.started.trim().length > 0
        ? a.task.started
        : '9999-12-31T23:59:59Z';

    const bKey =
      b.task.started && b.task.started.trim().length > 0
        ? b.task.started
        : '9999-12-31T23:59:59Z';

    return aKey.localeCompare(bKey);
  }

  // =========================================================================
  // ▼▼▼ 階層付きタスク表の Markdown 生成
  // =========================================================================

  private buildTaskTableFromTree(tree: TaskTree[]): string {
    const header =
      '| 状態 | タイトル | 計画🍅 | 実績✅ | 開始 | 完了 |\n' +
      '|------|------------|--------|--------|--------|--------|';

    const rows: string[] = [];

    const sortedRoots = tree.slice().sort((a, b) => this.sortNode(a, b));

    // ★ ルートノード順序ログ
    sortedRoots.forEach((node, i) => {
      logger.debug(
        `[TaskSummaryReportBuilder] root[${i}] order=${node.order ?? -1} ` +
          `started=${node.task.started ?? ''} title=${node.task.title}`
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

    const sortedChildren = node.children
      .slice()
      .sort((a, b) => this.sortNode(a, b));

    sortedChildren.forEach((child, i) => {
      logger.debug(
        `[TaskSummaryReportBuilder] child level=${level} idx=${i} ` +
          `order=${child.order ?? -1} started=${
            child.task.started ?? ''
          } title=${child.task.title}`
      );
    });

    sortedChildren.forEach((child) =>
      this.walkTreeForTable(child, level + 1, rows)
    );
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

  // =========================================================================
  // ▼▼▼ 未完了バックログ生成
  // =========================================================================

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

  // =========================================================================
  // ▼▼▼ 日時フォーマット
  // =========================================================================

  private toTime(utc?: string): string {
    if (!utc) return '';
    const d = new Date(utc);
    return `${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  }
}
