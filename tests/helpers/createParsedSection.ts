// tests/helpers/createParsedSection.ts
import type { ParsedSection } from 'src/core/models/daily_notes/reviews';
import type { SectionKey } from 'src/core/models/daily_notes/reviews/specs/SectionKey';

export function createParsedSection(
  key: SectionKey,
  body: string,
  opts?: {
    headingText?: string;
    level?: number;
  }
): ParsedSection {
  return {
    key,
    body,
    headingText: opts?.headingText ?? key,
    level: opts?.level ?? 2,
  };
}
