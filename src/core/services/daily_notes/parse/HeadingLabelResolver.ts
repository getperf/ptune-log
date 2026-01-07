// src/core/services/daily_notes/parse/HeadingLabelResolver.ts

import { HeadingSpecRegistry } from 'src/core/models/daily_notes/reviews/specs/HeadingSpecRegistry';
import { DailyNoteLabelKey } from 'src/core/models/daily_notes/SectionKey';
import { i18n } from 'src/i18n';
import { HeadingNormalizer } from './HeadingNormalizer';

/**
 * i18n 文言 → 正規化済み見出しラベルを提供
 * initI18n(lang) 後に呼ばれる前提
 */
export class HeadingLabelResolver {
  private static cache: Map<DailyNoteLabelKey, string> | null = null;

  /** 言語切替時に再構築 */
  static rebuild(): void {
    const map = new Map<DailyNoteLabelKey, string>();
    const t = i18n.domain.daily_note;

    for (const spec of HeadingSpecRegistry.all()) {
      // key → 表示タイトル（i18n）
      const title = t[spec.key as keyof typeof t];
      if (!title) continue;

      map.set(spec.key, HeadingNormalizer.normalize(title));
    }

    this.cache = map;
  }

  static normalizedTitle(key: DailyNoteLabelKey): string | undefined {
    return this.cache?.get(key);
  }
}
