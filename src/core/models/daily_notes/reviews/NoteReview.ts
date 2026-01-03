import { Section } from './Section';
import { DailyReport } from './DailyReport';

/**
 * NoteReview
 * - ノート由来レビューの集合体
 */
export class NoteReview {
  constructor(
    public readonly dailyTags: Section<void>,
    public readonly unregisteredTags: Section<void>,
    public readonly dailyReport: DailyReport,
    public readonly kpts: Section<void>[]   // KPT は配列
  ) { }

  /** 表示順で Section / Block を列挙 */
  toMarkdown(level = 2): string {
    const blocks: string[] = [];

    if (!this.dailyTags.isEmpty()) {
      blocks.push(this.dailyTags.toMarkdown(level));
    }

    if (!this.unregisteredTags.isEmpty()) {
      blocks.push(this.unregisteredTags.toMarkdown(level));
    }

    const reportMd = this.dailyReport.toMarkdown(level);
    if (reportMd) {
      blocks.push(reportMd);
    }

    for (const kpt of this.kpts) {
      if (!kpt.isEmpty()) {
        blocks.push(kpt.toMarkdown(level));
      }
    }

    return blocks.join('\n\n');
  }
}
