// src/core/services/daily_notes/file_io/DailyNoteWriter.ts

import { App, TFile } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';

export class DailyNoteWriter {
  constructor(private readonly app: App) {}

  /**
   * DailyNote を指定日のデイリーノートとして保存（上書き）
   */
  async write(note: DailyNote, date: Date): Promise<void> {
    const path = DailyNoteHelper.resolveDailyNotePath(this.app, date);
    const file = this.app.vault.getAbstractFileByPath(path);

    if (!(file instanceof TFile)) {
      throw new Error('Daily note not found');
    }

    const markdown = note.toMarkdown();
    await this.app.vault.modify(file, markdown);
  }
}
