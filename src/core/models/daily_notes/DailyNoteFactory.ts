// src/core/models/daily_notes/DailyNoteFactory.ts

import { DailyNote } from './DailyNote';
import { DailyNoteSectionKey } from './DailyNoteSection';
import { DailyNoteSectionParser } from 'src/core/services/daily_notes/DailyNoteSectionParser';

export class DailyNoteFactory {
  static fromMarkdown(markdown: string): DailyNote {
    const plannedTasks = DailyNoteSectionParser.extractOnce(
      markdown,
      DailyNoteSectionKey.PlannedTasks
    );

    const timeLog = DailyNoteSectionParser.extractAll(
      markdown,
      DailyNoteSectionKey.TaskReview
    );

    const dailyReport = DailyNoteSectionParser.extractOnce(
      markdown,
      DailyNoteSectionKey.DailyReport
    );

    const kptReports = DailyNoteSectionParser.extractAll(
      markdown,
      DailyNoteSectionKey.Kpt
    );

    return new DailyNote(plannedTasks, timeLog, dailyReport, kptReports);
  }
}
