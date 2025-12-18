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

  /** KPT 分析用の入力テキスト生成（スケルトン） */
  buildKptSourceText(): string {
    let text = '';

    if (this.dailyReport) {
      text += `【当日のサマリ】\n${this.dailyReport.trim()}`;
    }

    if (this.kptReports.length > 0) {
      text += `\n\n【既存のKPT分析】\n` + this.kptReports.join('\n\n---\n\n');
    }

    return text.trim();
  }
}
