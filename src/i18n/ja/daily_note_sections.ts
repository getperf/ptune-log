// src/i18n/ja/daily_note_sections.ts

import { DailyNoteSectionKey } from
  'src/core/models/daily_notes/DailyNoteSectionKey';

export const DAILY_NOTE_SECTION_LABELS_JA: Record<
  DailyNoteSectionKey,
  string
> = {
  // === 大分類 ===
  [DailyNoteSectionKey.PlannedTasks]: '今日の予定タスク',
  [DailyNoteSectionKey.TimeLog]: 'タイムログ／メモ',
  [DailyNoteSectionKey.ReviewMemo]: '振り返りメモ',

  // === 振り返り配下 ===
  [DailyNoteSectionKey.DailyReport]: 'デイリーレポート',
  [DailyNoteSectionKey.TagList]: 'タグ一覧',
  [DailyNoteSectionKey.Kpt]: 'KPT分析',

  // === 時間分析配下 ===
  [DailyNoteSectionKey.TimeAnalysisSummary]: '時間分析サマリ',
  [DailyNoteSectionKey.Backlog]: '未完了タスク',
  [DailyNoteSectionKey.DeltaLarge]: '差分（大）',
  [DailyNoteSectionKey.WorkTypeSummary]: '作業種別サマリ',
  [DailyNoteSectionKey.DailySummary]: '日次サマリ',
};
