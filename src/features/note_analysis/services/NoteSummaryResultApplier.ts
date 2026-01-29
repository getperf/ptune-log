// src/features/note_analysis/services/NoteSummaryResultApplier.ts

import { App } from 'obsidian';
import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { DailyNoteWriter } from 'src/core/services/daily_notes/file_io/DailyNoteWriter';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DateUtil } from 'src/core/utils/date/DateUtil';

/**
 * NoteSummaryResultApplier
 * - LLMが出力した「整理済みテキスト」を
 *   デイリーノートの KPT セクションに追記する
 * - 分析結果ではなく「素材」なので上書きはしない
 */
export class NoteSummaryResultApplier {
  private readonly writer: DailyNoteWriter;

  constructor(private readonly app: App) {
    this.writer = new DailyNoteWriter(app);
  }

  async apply(dailyNote: DailyNote, content: string): Promise<void> {
    const suffix = `(${DateUtil.localTime()})`;
    const updated = dailyNote.appendKpt(content, suffix, 'last');
    await this.writer.writeToActive(updated);

    logger.info('[KptResultApplier] apply completed');
  }
}
