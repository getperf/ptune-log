// File: src/core/models/tasks/MyTaskFactory.ts
import { MyTask } from './MyTask';
import { PomodoroInfo } from './MyTask/PomodoroInfo';
import { ParsedTask } from 'src/features/google_tasks/services/TasksExporter';
import { DateUtil } from 'src/core/utils/date/DateUtil';

export class MyTaskFactory {
  static fromApiData(task: any, tasklistId?: string): MyTask {
    // note から抽出
    const pomodoroFromNote = this.parsePomodoroInfo(task.notes);
    const startedFromNote = this.extractTimestamp('started', task.notes);
    const completedFromNote = this.extractTimestamp('completed', task.notes);
    const completedFromApi = this.parseDate(task.completed);

    // JSON直下の値をフォールバックとして利用
    const pomodoro =
      pomodoroFromNote ??
      (task.pomodoro
        ? new PomodoroInfo(
            task.pomodoro.planned ?? 0,
            task.pomodoro.actual ?? 0
          )
        : undefined);

    const started =
      startedFromNote ??
      (task.started ? this.parseDate(task.started) : undefined);

    const completed =
      completedFromNote ??
      completedFromApi ??
      (task.pomodoro?.actual ? this.parseDate(task.updated) : undefined);

    return new MyTask(
      task.id ?? '',
      task.title ?? '',
      tasklistId,
      this.extractNoteBody(task.notes),
      task.parent ?? undefined,
      task.position,
      pomodoro,
      task.status ?? 'needsAction',
      undefined,
      this.parseDate(task.due),
      completed,
      this.parseDate(task.updated),
      started,
      task.deleted ?? false
    );
  }

  /**
   * 指定されたキーからUTC時刻文字列（Zなし）を抽出します。
   * Google Tasksの仕様ではZがなくてもUTCとして解釈されます。
   */
  private static extractTimestamp(
    key: 'started' | 'completed',
    note?: string
  ): string | undefined {
    if (!note) return undefined;
    const pattern = new RegExp(`${key}=([^\\s]+)`);
    const match = note.match(pattern);
    return match ? match[1] : undefined;
  }

  private static extractNoteBody(note?: string): string | undefined {
    if (!note) return undefined;
    return (
      note
        .replace(/🍅x\d+/, '')
        .replace(/✅x\d+/, '')
        .replace(/started=[^\s]+/, '')
        .replace(/completed=[^\s]+/, '')
        .trim() || undefined
    );
  }

  private static parsePomodoroInfo(note?: string): PomodoroInfo | undefined {
    if (!note) return undefined;
    const planned = this.extractInt(note, /🍅x(\d+)/) ?? 0;
    const actual = this.extractFloat(note, /✅x([\d.]+)/);
    return new PomodoroInfo(planned, actual);
  }

  private static extractInt(text: string, pattern: RegExp): number | undefined {
    const match = text.match(pattern);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private static extractFloat(
    text: string,
    pattern: RegExp
  ): number | undefined {
    const match = text.match(pattern);
    return match ? parseFloat(match[1]) : undefined;
  }

  /** --- 文字列をUTC ISO文字列に変換 */
  private static parseDate(dateStr?: string): string | undefined {
    return dateStr ? DateUtil.utcString(new Date(dateStr)) : undefined;
  }

  static copyTaskData(source: MyTask, target: MyTask): void {
    for (const key of Object.keys(source)) {
      if (key === 'id') continue;
      const value = (source as any)[key];
      if (value == null || value === '' || value === 0) continue;

      if (key === 'pomodoro' && value instanceof PomodoroInfo) {
        if (!target.pomodoro) target.pomodoro = new PomodoroInfo(0);
        if (value.planned) target.pomodoro.planned = value.planned;
        if (value.actual) target.pomodoro.actual = value.actual;
      } else {
        (target as any)[key] = value;
      }
    }
  }

  /**
   * ParsedTask → MyTask 変換
   * Google Tasksエクスポート処理で使用
   */
  static fromParsedTask(parsed: ParsedTask, taskListName = 'Today'): MyTask {
    const pomodoro =
      parsed.pomodoro && parsed.pomodoro > 0
        ? new PomodoroInfo(parsed.pomodoro)
        : undefined;

    return new MyTask(
      '', // id
      parsed.title, // title
      undefined, // parent
      `from: ${taskListName}`, // note
      undefined, // tasklist_id
      undefined, // due
      pomodoro, // PomodoroInfo
      'needsAction', // status
      undefined, // position
      undefined, // priority
      undefined, // completed
      DateUtil.utcString(), // createdAt
      undefined, // updatedAt
      false // deleted
    );
  }
}
