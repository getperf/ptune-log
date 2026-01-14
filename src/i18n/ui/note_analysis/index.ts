// src/i18n/ui/daily_review/index.ts

import type { Lang } from '../../types';
import { noteAnalysisJa } from './ja';
import { noteAnalysisEn } from './en';

export function getNoteAnalysisI18n(lang: Lang) {
  switch (lang) {
    case 'en':
      return noteAnalysisEn;
    case 'ja':
    default:
      return noteAnalysisJa;
  }
}

export type NoteAnalysisI18n = ReturnType<typeof getNoteAnalysisI18n>;
