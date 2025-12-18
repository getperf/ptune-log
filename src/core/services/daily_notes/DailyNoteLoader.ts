// src/core/services/daily_notes/DailyNoteLoader.ts

import { App } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteFactory } from 'src/core/models/daily_notes/DailyNoteFactory';
import { DailyNoteReader } from './DailyNoteReader';

export class DailyNoteLoader {
  /**
   * App + Date から DailyNote を生成
   */
  static async load(app: App, date: Date): Promise<DailyNote> {
    const reader = new DailyNoteReader(app);
    const markdown = await reader.readForDate(date);
    return DailyNoteFactory.fromMarkdown(markdown);
  }
}
