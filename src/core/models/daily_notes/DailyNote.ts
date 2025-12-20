// src/core/models/daily_notes/DailyNote.ts

export class DailyNote {
  constructor(
    /** 今日の予定タスク */
    public readonly plannedTasks: string | undefined,

    /** タスク振り返り（複数） */
    public readonly timeLog: string[],

    /** デイリーレポート（単数） */
    public readonly dailyReport: string | undefined,

    /** KPT分析（複数） */
    public readonly kptReports: string[]
  ) {}

  /** KPT が1件以上存在するか */
  hasKpt(): boolean {
    return this.kptReports.length > 0;
  }

  /** 最新の KPT（存在しない場合 undefined） */
  latestKpt(): string | undefined {
    return this.kptReports.at(-1);
  }

  /** すべての過去KPTを結合（必要に応じて使用） */
  mergedKpt(separator = '\n\n---\n\n'): string | undefined {
    if (this.kptReports.length === 0) return undefined;
    return this.kptReports.join(separator);
  }
}
