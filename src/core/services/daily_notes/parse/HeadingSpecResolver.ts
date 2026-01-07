// src/core/services/daily_notes/parse/HeadingSpecResolver.ts

import { HeadingSpec } from 'src/core/models/daily_notes/specs/HeadingSpec';
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';
import { HeadingLabelResolver } from './HeadingLabelResolver';
import { HeadingNormalizer } from './HeadingNormalizer';

export class HeadingSpecResolver {
  static resolve(line: string): {
    spec?: HeadingSpec;
    level: number;
    suffix?: string;
  } {
    line = line.replace(/\r$/, '');
    const m = line.match(/^(#+)\s*(.+)$/);
    if (!m) return { level: 0 };

    const level = m[1].length;
    const raw = m[2];

    // suffix（末尾括弧）抽出
    const sm = raw.match(/^(.*?)(\s*[\(（].*[\)）])$/);
    const titlePart = sm ? sm[1] : raw;
    const suffix = sm ? sm[2].trim() : undefined;

    const normalized = HeadingNormalizer.normalize(titlePart);

    for (const spec of HeadingSpecRegistry.sectionSpecs()) {
      if (spec.level !== level) continue;

      const label = HeadingLabelResolver.normalizedTitle(spec.key);
      if (!label) continue;

      if (normalized.includes(label)) {
        return { spec, level, suffix };
      }
    }

    return { level };
  }
}
