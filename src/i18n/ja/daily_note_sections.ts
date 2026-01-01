// src/i18n/ja/daily_note_sections.ts

import { DailyNoteSectionKey } from 'src/core/models/daily_notes/DailyNoteSection';

export const DAILY_NOTE_SECTION_LABELS_JA: Record<
  DailyNoteSectionKey,
  string
> = {
  [DailyNoteSectionKey.PlannedTasks]: '今日の予定タスク',
  [DailyNoteSectionKey.TaskReview]: 'タスク振り返り',
  [DailyNoteSectionKey.DailyReport]: 'デイリーレポート',
  [DailyNoteSectionKey.Kpt]: 'KPT分析',
};
