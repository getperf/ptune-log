// src/core/services/daily_notes/parse/HeadingSpecResolver.ts
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';
import { HeadingNormalizer } from './HeadingNormalizer';
import { HeadingSpec } from 'src/core/models/daily_notes/specs/HeadingSpec';

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

    const sm = raw.match(/^(.*?)(\s*[(（].*[)）])$/);
    const titlePart = sm ? sm[1] : raw;
    const suffix = sm ? sm[2].trim() : undefined;

    const normalized = HeadingNormalizer.normalize(titlePart);

    for (const { spec, label } of HeadingSpecRegistry.sectionLabels()) {
      if (spec.level !== level) continue;
      const normalizedLabel = HeadingNormalizer.normalize(label);
      if (normalized.includes(normalizedLabel)) {
        return { spec, level, suffix };
      }
    }

    return { level };
  }
}
