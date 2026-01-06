// src/core/models/daily_notes/reviews/factories/DailyNoteFactory.ts
import { SectionParser } from 'src/core/services/daily_notes/parse/SectionParser';
import { DailyNote } from '../../DailyNote';
import { TaskReviewFactory } from './TaskReviewFactory';
import { NoteReviewFactory } from './NoteReviewFactory';

export class DailyNoteFactory {
  constructor(private readonly parser: SectionParser) {}

  fromMarkdown(markdown: string): DailyNote {
    const sections = this.parser.parse(markdown);
    const taskReview = TaskReviewFactory.build(sections);
    const noteReview = NoteReviewFactory.build(sections);
    return new DailyNote(taskReview, noteReview);
  }
}
