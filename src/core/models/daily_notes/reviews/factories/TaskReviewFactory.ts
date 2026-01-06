// src/core/services/daily_notes/TaskReviewFactory.ts
import { TaskReview } from 'src/core/models/daily_notes/reviews/entities/TaskReview';
import { Section } from 'src/core/models/daily_notes/reviews/entities/Section';
import { TimeLog } from 'src/core/models/daily_notes/reviews/entities/TimeLog';
import { ParsedSection } from '../entities/ParsedSection';

export class TaskReviewFactory {
  static build(sections: ParsedSection[]): TaskReview {
    // --- planned tasks ---
    const planned = sections.find((s) => s.key === 'task.planned');
    if (!planned) {
      throw new Error('TaskReviewFactory: task.planned not found');
    }

    const plannedSection = new Section<void>(
      planned.key,
      planned.key, // heading は key（表示は i18n 側で解決）
      planned.body
    );

    // --- time logs (task.review is repeatable) ---
    const timeLogs = sections
      .filter((s) => s.key === 'task.review')
      .map((s, index) => {
        const section = new Section<void>(s.key, s.key, s.body);

        // label は任意（再生成単位が必要な場合のみ）
        return new TimeLog(section, `review-${index + 1}`);
      });

    return new TaskReview(plannedSection, timeLogs);
  }
}
