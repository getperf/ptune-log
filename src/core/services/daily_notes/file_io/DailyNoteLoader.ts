// src/core/services/daily_notes/file_io/DailyNoteLoader.ts

import { App } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteReader } from './DailyNoteReader';
import { DailyNoteParser } from '../parse/DailyNoteParser';
import { FrontmatterHandler } from './FrontmatterHandler';

export class DailyNoteLoader {
  /**
   * App + Date から DailyNote を生成
   * - frontmatter はスキップ
   * - body のみを parse
   */
  static async load(app: App, date: Date): Promise<DailyNote> {
    const reader = new DailyNoteReader(app);
    const markdown = await reader.readForDate(date);

    const { body } = FrontmatterHandler.split(markdown);

    return DailyNoteParser.parse(body);
  }
}
