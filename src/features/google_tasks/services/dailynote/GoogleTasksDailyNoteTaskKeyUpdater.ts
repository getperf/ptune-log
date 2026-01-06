// File: src/core/services/notes/DailyNoteTaskKeyUpdateService.ts

import { App, TFile } from 'obsidian';
import { DailyNoteTaskKeyExtractor } from 'src/core/services/daily_notes/task_keys/DailyNoteTaskKeyExtractor';
import { DailyNoteTaskKeyWriter } from 'src/core/services/daily_notes/task_keys/DailyNoteTaskKeyWriter';
import { DailyNoteHelper } from 'src/core/utils/daily_note/DailyNoteHelper';

export interface DailyNoteTaskKeyUpdateResult {
  file: TFile;
  taskKeys: string[];
}

export class GoogleTasksDailyNoteTaskKeyUpdater {
  constructor(private readonly app: App) {}

  /**
   * 今日のデイリーノートから taskKeys を生成し frontmatter を更新
   */
  async execute(
    date: Date = new Date()
  ): Promise<DailyNoteTaskKeyUpdateResult> {
    const path = DailyNoteHelper.resolveDailyNotePath(this.app, date);
    const file = this.app.vault.getAbstractFileByPath(path);

    if (!(file instanceof TFile)) {
      throw new Error('Daily note not found');
    }

    const extractor = new DailyNoteTaskKeyExtractor(this.app);
    const writer = new DailyNoteTaskKeyWriter(this.app);

    const taskKeys = await extractor.extract(file);
    await writer.write(file, taskKeys);

    return { file, taskKeys };
  }
}
