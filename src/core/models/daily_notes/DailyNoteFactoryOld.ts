// src/core/models/daily_notes/DailyNoteFactory.ts

import { DailyNoteOld } from './DailyNoteOld';
import { DailyNoteSectionKeyOld } from './DailyNoteSectionKeyOld';
import { DailyNoteSectionParserOld } from 'src/core/services/daily_notes/parse/DailyNoteSectionParserOld';

export class DailyNoteFactoryOld {
  static fromMarkdown(markdown: string): DailyNoteOld {
    const plannedTasks = DailyNoteSectionParserOld.extractOnce(
      markdown,
      DailyNoteSectionKeyOld.PlannedTasks
    );

    const timeLog = DailyNoteSectionParserOld.extractAll(
      markdown,
      DailyNoteSectionKeyOld.TimeLog
    );

    const dailyReport = DailyNoteSectionParserOld.extractOnce(
      markdown,
      DailyNoteSectionKeyOld.DailyReport
    );

    const kptReports = DailyNoteSectionParserOld.extractAll(
      markdown,
      DailyNoteSectionKeyOld.Kpt
    );

    return new DailyNoteOld(plannedTasks, timeLog, dailyReport, kptReports);
  }
}
