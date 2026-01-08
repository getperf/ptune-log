// src/core/services/daily_notes/DailyNoteLoader.ts

import { App } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteReader } from './DailyNoteReader';
import { DailyNoteParser } from '../parse/DailyNoteParser';

export class DailyNoteLoader {
  /**
   * App + Date から DailyNote を生成
   */
  static async load(app: App, date: Date): Promise<DailyNote> {
    const reader = new DailyNoteReader(app);
    const markdown = await reader.readForDate(date);
    return DailyNoteParser.parse(markdown);
  }
}
