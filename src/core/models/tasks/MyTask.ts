import { MyTaskFactory } from './MyTaskFactory';
import { PomodoroInfo } from './MyTask/PomodoroInfo';

export class MyTask {
  constructor(
    public id: string,
    public title: string,
    public tasklist_id?: string,
    public note?: string,
    public parent?: string,
    public position?: string,
    public pomodoro?: PomodoroInfo,
    public status: 'needsAction' | 'completed' = 'needsAction',
    public subTasks?: MyTask[],
    public due?: string,
    public completed?: string, // UTC文字列
    public updated?: string,
    public started?: string, // UTC文字列
    public deleted: boolean = false
  ) {}

  toString(): string {
    const statusMarker = this.status === 'completed' ? '[x]' : '[ ]';
    const pomodoroStr = this.pomodoro ? ` ${this.pomodoro.toString()}` : '';
    const timeStr = this.formatTimeRange(this.started, this.completed);
    return `${statusMarker} ${this.title}${pomodoroStr}${timeStr}`;
  }

  private convertUtc(date: string): string {
    return date + (date.endsWith('Z') ? '' : 'Z');
  }

  private formatTimeRange(start?: string, end?: string): string {
    if (!start && !end) return '';
    const toTimeStr = (d: Date) =>
      `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}:${d
        .getSeconds()
        .toString()
        .padStart(2, '0')}`;
    try {
      const parts = [];
      if (start) parts.push(toTimeStr(new Date(this.convertUtc(start))));
      if (end) parts.push(toTimeStr(new Date(this.convertUtc(end))));
      return ` ${parts.join(' - ')}`;
    } catch {
      return '';
    }
  }

  toApiData(): Record<string, any> {
    const notes = [this.note];
    if (this.pomodoro) {
      let tomato = `🍅x${this.pomodoro.planned}`;
      if (this.pomodoro.actual !== undefined) {
        tomato += ` ✅x${this.pomodoro.actual}`;
      }
      notes.push(tomato);
    }

    const body: Record<string, any> = {
      title: this.title,
      notes: notes.filter(Boolean).join(' ').trim(),
      status: this.status || 'needsAction',
    };

    if (this.id) body['id'] = this.id;
    if (this.parent) body['parent'] = this.parent;
    if (this.due) body['due'] = this.due;

    return body;
  }

  cloneWithoutActuals(): MyTask {
    const newTask = new MyTask(this.id, this.title);
    MyTaskFactory.copyTaskData(this, newTask);
    newTask.started = undefined;
    newTask.completed = undefined;
    if (newTask.pomodoro) {
      newTask.pomodoro.actual = undefined;
    }
    return newTask;
  }
}
