// src/i18n/domain/index.ts
import type { Lang } from '../types';
import { getDailyNoteI18n } from './daily_note';
import { getTimeReviewI18n } from './time_review';

export function getDomainI18n(lang: Lang) {
  return {
    daily_note: getDailyNoteI18n(lang),
    timeReview: getTimeReviewI18n(lang),
    // tasks: getTaskDomainI18n(lang),
    // reports: getReportDomainI18n(lang),
  };
}

export type DomainI18n = ReturnType<typeof getDomainI18n>;
