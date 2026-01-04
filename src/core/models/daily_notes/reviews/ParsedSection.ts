// src/core/models/daily_notes/reviews/ParsedSection.ts
import { SectionKey } from './SectionKey';

export type ParsedSection = {
  key: SectionKey;
  heading: string;
  level: number;
  body: string;
};
