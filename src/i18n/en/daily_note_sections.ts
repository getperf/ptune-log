// src/i18n/en/daily_note_sections.ts

import { DailyNoteSectionKey } from
  'src/core/models/daily_notes/DailyNoteSectionKey';

export const DAILY_NOTE_SECTION_LABELS_EN: Record<
  DailyNoteSectionKey,
  string
> = {
  // === 大分類 ===
  [DailyNoteSectionKey.PlannedTasks]: 'Planned Tasks',
  [DailyNoteSectionKey.TimeLog]: 'Time Log / Memo',
  [DailyNoteSectionKey.ReviewMemo]: 'Review Memo',

  // === 振り返り配下 ===
  [DailyNoteSectionKey.DailyReport]: 'Daily Report',
  [DailyNoteSectionKey.TagList]: 'Tag List',
  [DailyNoteSectionKey.Kpt]: 'KPT Analysis',

  // === 時間分析配下 ===
  [DailyNoteSectionKey.TimeAnalysisSummary]: 'Time Analysis Summary',
  [DailyNoteSectionKey.Backlog]: 'Backlog',
  [DailyNoteSectionKey.DeltaLarge]: 'Large Deltas',
  [DailyNoteSectionKey.WorkTypeSummary]: 'Work Type Summary',
  [DailyNoteSectionKey.DailySummary]: 'Daily Summary',
};
