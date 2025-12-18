// src/core/models/daily_notes/DailyNoteFactory.ts

import { DailyNote } from './DailyNote';
import { DailyNoteSection } from './DailyNoteSection';
import { DailyNoteSectionParser } from 'src/core/services/daily_notes/DailyNoteSectionParser';

export class DailyNoteFactory {
  static fromMarkdown(markdown: string): DailyNote {
    const plannedTasks = DailyNoteSectionParser.extractOnce(
      markdown,
      DailyNoteSection.PlannedTasks
    );

    const timeLog = DailyNoteSectionParser.extractAll(
      markdown,
      DailyNoteSection.TaskReview
    );

    const dailyReport = DailyNoteSectionParser.extractOnce(
      markdown,
      DailyNoteSection.DailyReport
    );

    const kptReports = DailyNoteSectionParser.extractAll(
      markdown,
      DailyNoteSection.Kpt
    );

    return new DailyNote(plannedTasks, timeLog, dailyReport, kptReports);
  }
}
