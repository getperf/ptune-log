import { Section } from './Section';
import { TimeLog } from './TimeLog';

export class TaskReview {
  private readonly timeLogs: TimeLog[] = [];

  constructor(
    public readonly plannedTasks: Section<void>
  ) { }

  /** TimeLog 追加（再実行用） */
  addTimeLog(log: TimeLog): void {
    this.timeLogs.push(log);
  }

  /** TimeLog 一覧取得 */
  getTimeLogs(): readonly TimeLog[] {
    return this.timeLogs;
  }

  /** 表示用 Markdown */
  toMarkdown(level = 2): string {
    const blocks: string[] = [];

    if (!this.plannedTasks.isEmpty()) {
      blocks.push(this.plannedTasks.toMarkdown(level));
    }

    for (const log of this.timeLogs) {
      const md = log.toMarkdown(level + 1);
      if (md) {
        blocks.push(md);
      }
    }

    return blocks.join('\n\n');
  }
}
