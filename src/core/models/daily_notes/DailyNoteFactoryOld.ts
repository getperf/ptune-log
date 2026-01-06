// src/core/models/daily_notes/DailyNoteFactory.ts

import { DailyNoteOld } from './DailyNoteOld';
import { DailyNoteSectionKey } from './DailyNoteSectionKey';
import { DailyNoteSectionParser } from 'src/core/services/daily_notes/parse/DailyNoteSectionParser';

export class DailyNoteFactoryOld {
  static fromMarkdown(markdown: string): DailyNoteOld {
    const plannedTasks = DailyNoteSectionParser.extractOnce(
      markdown,
      DailyNoteSectionKey.PlannedTasks
    );

    const timeLog = DailyNoteSectionParser.extractAll(
      markdown,
      DailyNoteSectionKey.TimeLog
    );

    const dailyReport = DailyNoteSectionParser.extractOnce(
      markdown,
      DailyNoteSectionKey.DailyReport
    );

    const kptReports = DailyNoteSectionParser.extractAll(
      markdown,
      DailyNoteSectionKey.Kpt
    );

    return new DailyNoteOld(plannedTasks, timeLog, dailyReport, kptReports);
  }
}
