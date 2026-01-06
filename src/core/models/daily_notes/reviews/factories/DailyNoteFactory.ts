// src/core/models/daily_notes/DailyNoteFactory.ts
import { SectionParser } from 'src/core/services/daily_notes/SectionParser';
import { DailyNote } from '../../DailyNote';
import { TaskReviewFactory } from './TaskReviewFactory';
import { NoteReviewFactory } from './NoteReviewFactory';

export class DailyNoteFactory {
  constructor(private readonly parser: SectionParser) {}

  fromMarkdown(markdown: string): DailyNote {
    const sections = this.parser.parse(markdown);

    const taskReview = TaskReviewFactory.build(sections);
    const noteReview = NoteReviewFactory.fromSections(sections);

    return new DailyNote(taskReview, noteReview);
  }
}
