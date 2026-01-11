// src/core/services/notes/DailyNoteReader.ts
import { App } from 'obsidian';
import { DailyNoteHelper } from '../../../utils/daily_note/DailyNoteHelper';

export class DailyNoteReader {
  constructor(private readonly app: App) { }

  async readForDate(date: Date): Promise<string> {
    const note = await DailyNoteHelper.getOrOpenDailyNoteForDate(
      this.app,
      date
    );
    if (!note) return '';

    const raw = await this.app.vault.read(note);

    // ★ 改行正規化（Windows / macOS / Linux 対応）
    return raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
}
