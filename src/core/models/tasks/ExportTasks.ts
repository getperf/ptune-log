import { App, normalizePath } from 'obsidian';
import { ParsedTask } from 'src/features/google_tasks/services/TasksExporter';
import { logger } from 'src/core/services/logger/loggerInstance';

export interface ExportTask {
  title: string;
  fullTitle: string; // 表示・階層管理用（例: "親/子"）
  taskKey: string; // ファイル名安全なキー（例: "親_子"）
  parentTitle?: string;
  children?: ExportTask[];
  rawLine?: string;
}

/** タスク名を正規化してファイル名安全なキーに変換 */
function normalizeTaskKey(name: string): string {
  return name
    .replace(/[\\/:%*?"<>| ]+/g, '_') // 禁止文字や空白を置換
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export class ExportTasks {
  static readonly BASE_DIR = '_journal/meta';
  static readonly DEFAULT_NOTE_PATH = '_projects';
  static readonly DEFAULT_TASK_LIST = 'Today';

  dateStr: string;
  tasks: ExportTask[];

  constructor(date: string, tasks: ExportTask[]) {
    this.dateStr = date;
    this.tasks = tasks;
  }

  /** --- Factory: ParsedTask[] → ExportTasks --- */
  static fromParsedTasks(parsed: ParsedTask[]): ExportTasks {
    const dateStr = new Date().toLocaleDateString('sv-SE');
    const nodeMap = new Map<number, ExportTask>();

    // ノード作成
    for (const p of parsed) {
      const key = normalizeTaskKey(p.title);
      nodeMap.set(p.index, {
        title: p.title,
        fullTitle: p.title,
        taskKey: key,
        rawLine: p.rawLine,
      });
    }

    // 親子リンク作成
    const roots: ExportTask[] = [];
    for (const p of parsed) {
      const node = nodeMap.get(p.index)!;
      if (p.parent_index === undefined) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(p.parent_index);
        if (parent) {
          parent.children ??= [];
          node.parentTitle = parent.title;
          node.fullTitle = `${parent.title}/${node.title}`;
          node.taskKey = normalizeTaskKey(`${parent.title}_${node.title}`);
          parent.children.push(node);
        }
      }
    }

    return new ExportTasks(dateStr, roots);
  }

  async save(app: App): Promise<string> {
    const fileName = `export_tasks_${this.dateStr}.json`;
    const path = normalizePath(`${ExportTasks.BASE_DIR}/${fileName}`);
    const adapter = app.vault.adapter;

    if (!(await adapter.exists(ExportTasks.BASE_DIR))) {
      await adapter.mkdir(ExportTasks.BASE_DIR);
    }

    const payload = {
      notePath: ExportTasks.DEFAULT_NOTE_PATH,
      taskList: ExportTasks.DEFAULT_TASK_LIST,
      tasks: this.tasks,
    };

    await adapter.write(path, JSON.stringify(payload, null, 2));
    logger.info(`[ExportTasks] saved: ${path}`);
    return path;
  }

  static async load(app: App, date?: Date): Promise<ExportTasks | null> {
    if (!date) date = new Date();
    const dateStr = date.toLocaleDateString('sv-SE');
    const fileName = `export_tasks_${dateStr}.json`;
    const path = normalizePath(`${ExportTasks.BASE_DIR}/${fileName}`);
    const adapter = app.vault.adapter;

    if (!(await adapter.exists(path))) {
      logger.warn(`[ExportTasks] file not found: ${path}`);
      return null;
    }

    const jsonText = await adapter.read(path);
    const raw = JSON.parse(jsonText);
    return new ExportTasks(dateStr, raw.tasks);
  }

  /** --- JSONファイルのパスを取得 --- */
  getJsonPath(): string {
    const fileName = `export_tasks_${this.dateStr}.json`;
    return normalizePath(`${ExportTasks.BASE_DIR}/${fileName}`);
  }

  /** 表示用のタスクリスト（階層インデント付き） */
  toDisplayList(): ExportTask[] {
    const result: ExportTask[] = [];
    const walk = (nodes: ExportTask[], depth = 0) => {
      for (const node of nodes) {
        result.push({
          ...node,
          title: `${'　'.repeat(depth)}${node.title}`,
        });
        if (node.children?.length) walk(node.children, depth + 1);
      }
    };
    walk(this.tasks);
    return result;
  }

  static normalizeTaskKey(name: string): string {
    return normalizeTaskKey(name);
  }
}
