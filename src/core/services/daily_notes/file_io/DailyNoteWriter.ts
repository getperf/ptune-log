// src/core/services/daily_notes/file_io/DailyNoteWriter.ts

import { App, TFile } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';
import { FrontmatterHandler } from './FrontmatterHandler';
import { createAndLogError } from 'src/core/utils/errors/errorFactory';

export class DailyNoteWriter {
  constructor(private readonly app: App) { }

  /**
   * DailyNote を指定日のデイリーノートとして保存
   * - 既存 frontmatter は保持
   * - body のみ差し替え
   */
  async write(note: DailyNote, date: Date): Promise<void> {
    const path = DailyNoteHelper.resolveDailyNotePath(this.app, date);
    const file = this.app.vault.getAbstractFileByPath(path);

    if (!(file instanceof TFile)) {
      throw createAndLogError('Daily note not found');
    }

    const original = await this.app.vault.read(file);
    const { frontmatter } = FrontmatterHandler.split(original);

    const body = note.toMarkdown();
    const merged = FrontmatterHandler.merge(frontmatter, body);

    await this.app.vault.modify(file, merged);
  }
}
