// src/core/services/daily_notes/SectionParser.ts
import { HeadingSpec } from 'src/core/models/daily_notes/reviews/specs/HeadingSpec';
import { SectionKey } from 'src/core/models/daily_notes/reviews/specs/SectionKey';
import { HeadingNormalizer } from './HeadingNormalizer';
import { DailyNoteSectionRegex } from 'src/core/utils/daily_note/DailyNoteSectionRegex';

export type ParsedSection = {
  key: SectionKey;
  body: string;
};

export class SectionParser {
  private readonly sectionSpecs: HeadingSpec[];
  private readonly labelMap: Map<string, SectionKey>;

  constructor(
    specs: HeadingSpec[],
    labels: Record<string, string>
  ) {
    this.sectionSpecs = specs.filter(s => s.kind === 'section');

    this.labelMap = new Map();
    for (const spec of this.sectionSpecs) {
      const label = labels[spec.key];
      if (!label) continue;

      this.labelMap.set(
        HeadingNormalizer.normalize(label),
        spec.key as SectionKey
      );
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
          result.push({ ...current, body: current.body.trim() });
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
          current = { key: matchedKey, body: '' };
        }
        continue;
      }

      if (current) {
        current.body += (current.body ? '\n' : '') + line;
      }
    }

    if (current) {
      result.push({ ...current, body: current.body.trim() });
    }

    return result;
  }
}
