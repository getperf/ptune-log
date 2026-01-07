// src/core/models/daily_notes/DailyNote.ts

import { Section } from './Section';
import { SectionList } from './SectionList';

export class DailyNote {
  readonly raw: string;

  readonly plannedTask: Section;
  readonly timeLogs: SectionList;
  readonly reviewMemo: Section;
  readonly reviewedNote: Section;
  readonly kpts: SectionList;

  constructor(params: {
    raw: string;
    plannedTask: Section;
    timeLogs?: SectionList;
    reviewMemo: Section;
    reviewedNote: Section;
    kpts?: SectionList;
  }) {
    this.raw = params.raw;
    this.plannedTask = params.plannedTask;
    this.timeLogs = params.timeLogs ?? new SectionList();
    this.reviewMemo = params.reviewMemo;
    this.reviewedNote = params.reviewedNote;
    this.kpts = params.kpts ?? new SectionList();
  }

  /* -----------------
   * Immutable Update APIs
   * ----------------- */

  updatePlannedTask(markdown: string): DailyNote {
    return new DailyNote({
      ...this,
      plannedTask: this.plannedTask.replaceBody(markdown),
    });
  }

  updateReviewMemo(markdown: string): DailyNote {
    return new DailyNote({
      ...this,
      reviewMemo: this.reviewMemo.replaceBody(markdown),
    });
  }

  appendReviewMemo(markdown: string): DailyNote {
    return new DailyNote({
      ...this,
      reviewMemo: this.reviewMemo.appendBody(markdown),
    });
  }

  updateReviewedNote(markdown: string): DailyNote {
    return new DailyNote({
      ...this,
      reviewedNote: this.reviewedNote.replaceBody(markdown),
    });
  }

  /** --- KPT 追記（template 不要） */
  appendKpt(markdown: string, suffix?: string): DailyNote {
    return new DailyNote({
      ...this,
      kpts: this.kpts.append(
        new Section({
          key: 'note.kpt',
          body: markdown,
          suffix,
          present: true,
        })
      ),
    });
  }

  /** --- タイムログ追記（template 不要） */
  appendTimeLog(markdown: string, suffix?: string): DailyNote {
    return new DailyNote({
      ...this,
      timeLogs: this.timeLogs.append(
        new Section({
          key: 'task.timelog',
          body: markdown,
          suffix,
          present: true,
        })
      ),
    });
  }
}
