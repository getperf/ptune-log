// src/core/services/notes/DailyNoteReader.ts
import { App, TFile } from 'obsidian';
import { DailyNoteHelper } from '../../../utils/daily_note/DailyNoteHelper';

export class DailyNoteReader {
  constructor(private readonly app: App) {}

  async readForDate(date: Date): Promise<string> {
    const note = await DailyNoteHelper.getOrOpenDailyNoteForDate(
      this.app,
      date
    );
    if (!note) return '';

    return await this.app.vault.read(note);
  }
}
