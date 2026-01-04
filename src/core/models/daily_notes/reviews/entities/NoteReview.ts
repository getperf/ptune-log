import { Section } from './Section';
import { DailyReport } from './DailyReport';

/**
 * NoteReview
 * - ノート由来レビューの集合体
 */
export class NoteReview {
  constructor(
    public readonly dailyTags: Section<void>,
    public readonly dailyReport: DailyReport,
    public readonly kpts: Section<void>[]
  ) { }
}