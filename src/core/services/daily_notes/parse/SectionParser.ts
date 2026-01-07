// src/core/services/daily_notes/SectionParser.ts
import { HeadingSpecRegistry } from 'src/core/models/daily_notes/reviews/specs/HeadingSpecRegistry';
import { SectionKey } from 'src/core/models/daily_notes/SectionKey';
import { HeadingNormalizer } from './HeadingNormalizer';
import { ParsedSection } from 'src/core/models/daily_notes/reviews';
import { DailyNoteSectionRegex } from 'src/core/utils/daily_note/DailyNoteSectionRegex';

export class SectionParser {
  private readonly labelMap = new Map<string, SectionKey>();

  constructor(labels: Record<SectionKey, string>) {
    for (const spec of HeadingSpecRegistry.sectionSpecs()) {
      const label = labels[spec.key];
      if (!label) continue;
      this.labelMap.set(HeadingNormalizer.normalize(label), spec.key);
    }
  }

  parse(markdown: string): ParsedSection[] {
    const lines = markdown.split('\n');
    const result: ParsedSection[] = [];

    let current: ParsedSection | null = null;

    for (const line of lines) {
      const headingText = DailyNoteSectionRegex.extractHeadingText(line);
      const isBoundary = DailyNoteSectionRegex.isSectionBoundary(line);

      if (headingText && isBoundary) {
        if (current) {
          current.body = current.body.trim();
          result.push(current);
          current = null;
        }

        const normalized = HeadingNormalizer.normalize(headingText);

        let matchedKey: SectionKey | undefined;
        for (const [labelKey, sectionKey] of this.labelMap.entries()) {
          if (normalized.startsWith(labelKey)) {
            matchedKey = sectionKey;
            break;
          }
        }

        if (matchedKey) {
          current = {
            key: matchedKey,
            headingText,
            level: this.extractLevel(line),
            body: '',
          };
        }
        continue;
      }

      if (current) {
        current.body += (current.body ? '\n' : '') + line;
      }
    }

    if (current) {
      current.body = current.body.trim();
      result.push(current);
    }

    return result;
  }

  private extractLevel(line: string): number {
    const m = line.match(/^(#+)\s+/);
    return m ? m[1].length : 0;
  }
}
