// File: src/features/daily_review/services/DailyReviewApplier.ts

import { App } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { DailyNoteLoader } from 'src/core/services/daily_notes/file_io/DailyNoteLoader';
import { DailyNoteWriter } from 'src/core/services/daily_notes/file_io/DailyNoteWriter';
import { DailyReviewSummaryBuilder } from './DailyReviewSummaryBuilder';
import { DailyReviewTagListBuilder } from './DailyReviewTagListBuilder';

export class DailyReviewApplier {
  private readonly writer: DailyNoteWriter;

  constructor(private readonly app: App) {
    this.writer = new DailyNoteWriter(app);
  }

  async apply(date: Date, summaries: NoteSummaries): Promise<void> {
    const dailyNote = await DailyNoteLoader.load(this.app, date);

    const summaryMd =
      DailyReviewSummaryBuilder.build(summaries);

    const tagListMd =
      DailyReviewTagListBuilder.build(summaries);

    const updated = dailyNote
      .updateReviewedNote(summaryMd)
      .updateReviewMemo(tagListMd);

    await this.writer.write(updated, date);
  }
}
