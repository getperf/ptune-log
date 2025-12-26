// File: src/features/google_tasks/services/time_analysis/models/TaskExecutionEntry.ts

export class TaskExecutionEntry {
  constructor(
    public readonly taskKey: string,
    public readonly id: string,
    public readonly title: string,
    public readonly status: 'completed' | 'needsAction',
    public readonly parent?: string,
    public readonly pomodoro?: {
      planned?: number;
      actual?: number;
    },
    public readonly started?: string,
    public readonly completed?: string
  ) {}
}
