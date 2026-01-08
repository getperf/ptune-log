// src/core/services/daily_notes/parse/HeadingSpecResolver.ts
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/specs/HeadingSpecRegistry';
import { HeadingNormalizer } from './HeadingNormalizer';
import { HeadingSpec } from 'src/core/models/daily_notes/specs/HeadingSpec';
import { i18n } from 'src/i18n';
import { logger } from '../../logger/loggerInstance';

export class HeadingSpecResolver {
  // src/core/services/daily_notes/parse/HeadingSpecResolver.ts

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

    const normalized = HeadingNormalizer.normalize(raw);

    for (const { spec, label } of HeadingSpecRegistry.sectionLabels()) {
      if (spec.level !== level) continue;

      const normalizedLabel = HeadingNormalizer.normalize(label);

      if (normalized.startsWith(normalizedLabel)) {
        const rest = raw.slice(label.length).trim();
        const suffix = rest.length > 0 ? rest : undefined;

        return { spec, level, suffix };
      }
    }
    return { level };
  }
}
