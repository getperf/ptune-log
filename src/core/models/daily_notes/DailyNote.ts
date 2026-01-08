// src/core/models/daily_notes/DailyNote.ts

import { DailyNoteMarkdownBuilder } from 'src/core/services/daily_notes/markdown/DailyNoteMarkdownBuilder';
import { Section } from './Section';
import { SectionList } from './SectionList';

export class DailyNote {
  readonly raw: string;
  readonly date: Date;

  readonly plannedTask: Section;

  /** ★ 単一セクション */
  readonly taskTimelog: Section;

  /** ★ 複数レビュー */
  readonly taskReviews: SectionList;

  readonly reviewMemo: Section;
  readonly reviewedNote: Section;
  readonly kpts: SectionList;

  constructor(params: {
    raw: string;
    date?: Date;
    plannedTask: Section;
    taskTimelog: Section;
    taskReviews?: SectionList;
    reviewMemo: Section;
    reviewedNote: Section;
    kpts?: SectionList;
  }) {
    this.raw = params.raw;
    this.date = params.date ?? new Date();

    this.plannedTask = params.plannedTask;
    this.taskTimelog = params.taskTimelog;
    this.taskReviews = params.taskReviews ?? new SectionList();

    this.reviewMemo = params.reviewMemo;
    this.reviewedNote = params.reviewedNote;
    this.kpts = params.kpts ?? new SectionList();
  }

  static fromParsed(params: {
    raw: string;
    date?: Date;
    plannedTask: Section;
    taskTimelog: Section;
    taskReviews?: SectionList;
    reviewMemo: Section;
    reviewedNote: Section;
    kpts?: SectionList;
  }): DailyNote {
    return new DailyNote(params);
  }

  /* ---------- Immutable APIs ---------- */
  updatePlannedTask(markdown: string): DailyNote {
    return new DailyNote({
      ...this,
      plannedTask: this.plannedTask.replaceBody(markdown),
    });
  }

  updateTaskTimelog(markdown: string): DailyNote {
    return new DailyNote({
      ...this,
      taskTimelog: this.taskTimelog.replaceBody(markdown),
    });
  }

  appendTaskReview(markdown: string, suffix?: string): DailyNote {
    return new DailyNote({
      ...this,
      taskReviews: this.taskReviews.append(
        new Section({
          key: 'task.review',
          body: markdown,
          suffix,
          present: true,
        })
      ),
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

  toMarkdown(): string {
    return DailyNoteMarkdownBuilder.build(this);
  }
}
