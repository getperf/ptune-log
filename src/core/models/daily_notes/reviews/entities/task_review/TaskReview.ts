import { Section } from '../Section';
import { TimeLog } from './TimeLog';

export class TaskReview {
  constructor(
    public readonly plannedTasks: Section<void>,
    public readonly timeLogs: TimeLog[]
  ) {}

  /** TimeLog 追加 */
  addTimeLog(log: TimeLog): void {
    this.timeLogs.push(log);
  }
}
