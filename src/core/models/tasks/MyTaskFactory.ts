// File: src/core/models/tasks/MyTaskFactory.ts
import { MyTask } from './MyTask';
import { PomodoroInfo } from './MyTask/PomodoroInfo';
import { ParsedTask } from 'src/features/google_tasks/services/TasksExporter';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { GoogleTaskDto } from './GoogleTaskDto';

export class MyTaskFactory {
  static fromApiData(task: GoogleTaskDto, tasklistId?: string): MyTask {
    // note から抽出
    const pomodoroFromNote = this.parsePomodoroInfo(task.note);
    const startedFromNote = this.extractTimestamp('started', task.note);
    const completedFromNote = this.extractTimestamp('completed', task.note);
    const completedFromApi = this.parseDate(task.completed);

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
      this.extractNoteBody(task.note),
      task.parent,
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
    if (source.title) target.title = source.title;
    if (source.tasklist_id) target.tasklist_id = source.tasklist_id;
    if (source.note) target.note = source.note;
    if (source.parent) target.parent = source.parent;
    if (source.position) target.position = source.position;

    if (source.pomodoro) {
      target.pomodoro = new PomodoroInfo(
        source.pomodoro.planned,
        source.pomodoro.actual
      );
    }

    if (source.status) target.status = source.status;
    if (source.subTasks) target.subTasks = [...source.subTasks];
    if (source.due) target.due = source.due;
    if (source.completed) target.completed = source.completed;
    if (source.updated) target.updated = source.updated;
    if (source.started) target.started = source.started;
    target.deleted = source.deleted;
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
