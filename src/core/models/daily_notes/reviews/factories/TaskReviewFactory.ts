// src/core/models/daily_notes/reviews/factories/TaskReviewFactory.ts
import { ParsedSection } from 'src/core/models/daily_notes/reviews';
import { TaskReview } from '../entities/task_review/TaskReview';
import { SectionOld } from '../entities/SectionOld';
import { TimeLog } from '../entities/task_review/TimeLog';

export class TaskReviewFactory {
  static build(sections: ParsedSection[]): TaskReview {
    const plannedSection = SectionOld.fromParsedOrEmpty(
      sections.find((s) => s.key === 'task.planned'),
      'task.planned'
    );

    const timeLogs = sections
      .filter((s) => s.key === 'task.review')
      .map(
        (s, index) =>
          new TimeLog(SectionOld.fromParsed(s), `review-${index + 1}`)
      );

    return new TaskReview(plannedSection, timeLogs);
  }
}
