// src/core/models/daily_notes/DailyNoteSection.ts

/**
 * デイリーノート内セクション定義
 * ※ 絵文字は含めない（判定はテキストのみ）
 */
export enum DailyNoteSection {
  PlannedTasks = '今日の予定タスク',
  TaskReview = 'タスク振り返り',
  DailyReport = 'デイリーレポート',
  Kpt = 'KPT分析',
}
