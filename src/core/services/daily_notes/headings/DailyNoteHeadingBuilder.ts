// src/core/services/daily_notes/DailyNoteHeadingBuilder.ts

import { DailyNoteSectionKey } from "src/core/models/daily_notes/DailyNoteSectionKey";

type HeadingMeta = {
  level: 2 | 3 | 4 | 5;
  emoji?: string;
};

const META: Record<DailyNoteSectionKey, HeadingMeta> = {
  // 大分類
  [DailyNoteSectionKey.PlannedTasks]: { level: 2, emoji: '✅' },
  [DailyNoteSectionKey.TimeLog]: { level: 2, emoji: '🕒' },
  [DailyNoteSectionKey.ReviewMemo]: { level: 2, emoji: '🙌' },

  // 振り返り配下
  [DailyNoteSectionKey.DailyReport]: { level: 3, emoji: '🏷' },
  [DailyNoteSectionKey.TagList]: { level: 3, emoji: '📌' },
  [DailyNoteSectionKey.Kpt]: { level: 3, emoji: '🧠' },

  // 時間分析
  [DailyNoteSectionKey.TimeAnalysisSummary]: { level: 4, emoji: '⏱' },
  [DailyNoteSectionKey.Backlog]: { level: 4 },
  [DailyNoteSectionKey.DeltaLarge]: { level: 5 },
  [DailyNoteSectionKey.WorkTypeSummary]: { level: 5 },
  [DailyNoteSectionKey.DailySummary]: { level: 5 },
};

export class DailyNoteHeadingBuilder {
  static build(opts: {
    section: DailyNoteSectionKey;
    suffix?: string;     // (YYYY-MM-DD hh:mm:ss)
    rawLabel?: string;   // i18n を使わない場合
  }): string {
    const meta = META[opts.section];
    // const label = opts.rawLabel ?? i18n.tDailyNoteSection(opts.section);
    const label = opts.rawLabel;
    const hashes = '#'.repeat(meta.level);
    const emoji = meta.emoji ? `${meta.emoji} ` : '';
    const suffix = opts.suffix ? ` ${opts.suffix}` : '';

    return `${hashes} ${emoji}${label}${suffix}`;
  }
}


