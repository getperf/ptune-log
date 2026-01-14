// File: src/features/daily_review/services/DailyReviewApplier.ts

import { App } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteLoader } from 'src/core/services/daily_notes/file_io/DailyNoteLoader';
import { DailyNoteWriter } from 'src/core/services/daily_notes/file_io/DailyNoteWriter';
import { DailyReviewSummaryBuilder } from './DailyReviewSummaryBuilder';
import { DailyReviewTagListBuilder } from './DailyReviewTagListBuilder';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';
import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';
import { getText } from './comment';

export class DailyReviewApplier {
  private readonly writer: DailyNoteWriter;

  constructor(
    private readonly app: App,
    private readonly settings: ReviewSettings
  ) {
    this.writer = new DailyNoteWriter(app);
  }

  async apply(date: Date, summaries: NoteSummaries): Promise<void> {
    const dailyNote = await DailyNoteLoader.load(this.app, date);

    const tagListMd = DailyReviewTagListBuilder.build(summaries);
    const updated = this.applyReviewedNoteIfNeeded(
      dailyNote,
      summaries
    ).updateReviewMemo(tagListMd);

    await this.writer.write(updated, date);
  }

  /** reviewedNote は初回のみ更新する */
  private applyReviewedNoteIfNeeded(
    dailyNote: DailyNote,
    summaries: NoteSummaries
  ): DailyNote {
    if (!this.shouldUpdateReviewedNote(dailyNote)) {
      return dailyNote;
    }

    const summaryMd = DailyReviewSummaryBuilder.build(summaries, this.settings);

    const reviewedNoteMdParts: string[] = [summaryMd.trimEnd()];

    // --- KPT 実行コメント
    if (this.settings.enableDailyNoteUserReview) {
      const header = MarkdownCommentBlock.build(
        getText('daily-review-comment')
      );
      const footer = MarkdownCommentBlock.build(getText('kpt-action-comment'));
      reviewedNoteMdParts.unshift(header);
      reviewedNoteMdParts.push('', footer);
    }

    return dailyNote.updateReviewedNote(reviewedNoteMdParts.join('\n'));
  }

  /** reviewedNote 更新可否判定 */
  private shouldUpdateReviewedNote(dailyNote: DailyNote): boolean {
    return !dailyNote.reviewedNote.hasContent();
  }
}
