// src/core/services/daily_notes/DailyNoteContentUpdater.ts
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyReportMarkdownBuilder } from 'src/core/models/daily_notes/reviews/builder/DailyReportMarkdownBuilder';
import { NoteTagListMarkdownBuilder } from 'src/core/models/daily_notes/reviews/builder/NoteTagListMarkdownBuilder';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';

export class DailyNoteContentUpdater {
  static updateContent(
    content: string,
    summaries: NoteSummaries,
    dailyNote: DailyNote,
    dateStr: string,
    opts?: { enableChecklist?: boolean }
  ): string {
    let updated = content;

    if (!dailyNote.noteReview.hasDailyReport()) {
      updated = this.insertUnderReview(
        updated,
        DailyReportMarkdownBuilder.build(summaries, dateStr, opts)
      );
    }

    if (!dailyNote.noteReview.hasReviewMemo()) {
      updated = this.insertUnderReview(
        updated,
        NoteTagListMarkdownBuilder.build(summaries)
      );
    }

    return updated;
  }

  private static insertUnderReview(content: string, block: string): string {
    if (content.includes(block.trim())) {
      return content;
    }

    const marker = HeadingBuilder.create('note.review.memo');
    const idx = content.indexOf(marker);
    if (idx === -1) return content;

    return (
      content.slice(0, idx + marker.length) +
      '\n\n' +
      block +
      '\n' +
      content.slice(idx + marker.length)
    );
  }
}
