// src/core/services/daily_notes/DailyNoteLoader.ts

import { App } from 'obsidian';
import { DailyNoteOld } from 'src/core/models/daily_notes/DailyNoteOld';
import { DailyNoteFactoryOld } from 'src/core/models/daily_notes/DailyNoteFactoryOld';
import { DailyNoteReader } from './DailyNoteReader';

export class DailyNoteLoader {
  /**
   * App + Date から DailyNote を生成
   */
  static async load(app: App, date: Date): Promise<DailyNoteOld> {
    const reader = new DailyNoteReader(app);
    const markdown = await reader.readForDate(date);
    return DailyNoteFactoryOld.fromMarkdown(markdown);
  }
}
