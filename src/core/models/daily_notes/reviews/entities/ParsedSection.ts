// src/core/models/daily_notes/reviews/ParsedSection.ts
import { SectionKey } from '../../SectionKey';

export type ParsedSection = {
  key: SectionKey;
  headingText: string; // 実際の見出し（装飾含む）
  level: number;
  body: string;
};
