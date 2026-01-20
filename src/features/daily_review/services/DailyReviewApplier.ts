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
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { TagAliasCommitService } from 'src/core/services/tags/TagAliasCommitService';
import { logger } from 'src/core/services/logger/loggerInstance';

export class DailyReviewApplier {
  private readonly writer: DailyNoteWriter;

  constructor(
    private readonly app: App,
    private readonly settings: ReviewSettings,
  ) {
    this.writer = new DailyNoteWriter(app);
  }

  async apply(date: Date, summaries: NoteSummaries): Promise<void> {
    const dailyNote = await DailyNoteLoader.load(this.app, date);

    const tagListMd = DailyReviewTagListBuilder.build(summaries);
    const updated = this.applyReviewedNoteIfNeeded(
      dailyNote,
      summaries,
    ).updateReviewMemo(tagListMd);

    // --- daily note 確定 ---
    await this.writer.write(updated, date);

    // --- Alias 辞書 commit（振り返り確定点）---
    const newTags = summaries.getAllUnregisteredTags();
    if (newTags.length > 0) {
      logger.info(
        `[DailyReviewApplier] committing aliases (newTags=${newTags.length})`,
      );

      const aliases = new TagAliases();
      await aliases.load(this.app.vault);

      const commitService = new TagAliasCommitService(aliases);
      await commitService.commit(newTags, this.app.vault);
    }
  }

  /** reviewedNote は初回のみ更新する */
  private applyReviewedNoteIfNeeded(
    dailyNote: DailyNote,
    summaries: NoteSummaries,
  ): DailyNote {
    if (!this.shouldUpdateReviewedNote(dailyNote)) {
      return dailyNote;
    }

    const summaryMd = DailyReviewSummaryBuilder.build(summaries, this.settings);
    const reviewedNoteMdParts: string[] = [summaryMd.trimEnd()];

    if (this.settings.enableDailyNoteUserReview) {
      const header = MarkdownCommentBlock.build(
        getText('daily-review-comment'),
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
