// src/core/utils/daily_note/HeadingBuilder.ts
import { i18n } from 'src/i18n';
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/reviews/specs/HeadingSpecRegistry';
import { DailyNoteLabelKey } from 'src/core/models/daily_notes/reviews/specs/SectionKey';

/**
 * HeadingBuilder
 * - HeadingSpec + i18n から Markdown 見出しを生成
 */
export class HeadingBuilder {
  static create(key: DailyNoteLabelKey, opts?: { suffix?: string }): string {
    const spec = HeadingSpecRegistry.get(key);
    const label = i18n.domain.daily_note[key];

    if (!label) {
      throw new Error(`DailyNote i18n label not found: ${key}`);
    }

    const prefix = '#'.repeat(spec.level);
    const emoji = spec.emoji ? `${spec.emoji} ` : '';
    const suffix = opts?.suffix ?? '';

    return `${prefix} ${emoji}${label}${suffix}`;
  }
}
