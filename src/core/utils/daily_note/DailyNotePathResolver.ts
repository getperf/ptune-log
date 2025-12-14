// src/core/utils/daily_note/DailyNotePathResolver.ts
import { normalizePath } from 'obsidian';
import { getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import { DateUtil } from 'src/core/utils/date/DateUtil';

export class DailyNotePathResolver {
  static resolve(date: Date): string {
    const settings = getDailyNoteSettings();
    const dateStr = DateUtil.m(date).format(settings.format);
    return normalizePath(`${settings.folder}/${dateStr}.md`);
  }
}
