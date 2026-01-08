// src/core/services/daily_notes/markdown/DailyNoteMarkdownBuilder.ts

import { DailyNote } from 'src/core/models/daily_notes/DailyNote';
import { Section } from 'src/core/models/daily_notes/Section';
import { HeadingBuilder } from 'src/core/utils/daily_note/HeadingBuilder';

export class DailyNoteMarkdownBuilder {
  static build(note: DailyNote): string {
    const out: string[] = [];

    // --- planned task ---
    this.writeSingleSection(out, note.plannedTask);

    // --- time logs (list) ---
    for (const section of note.timeLogs.items()) {
      this.writeSingleSection(out, section);
    }

    // --- review memo ---
    this.writeSingleSection(out, note.reviewMemo);

    // --- reviewed note ---
    this.writeSingleSection(out, note.reviewedNote);

    // --- KPT ---
    for (const section of note.kpts.items()) {
      this.writeSingleSection(out, section);
    }

    // 末尾改行は 1 行に統一
    return out.join('\n').trimEnd() + '\n';
  }

  private static writeSingleSection(out: string[], section: Section): void {
    if (!section.present) return;
    if (!section.hasContent()) return;

    out.push(HeadingBuilder.create(section.key, { suffix: section.suffix }));
    out.push('');
    out.push(section.body.trimEnd());
    out.push('');
  }
}
