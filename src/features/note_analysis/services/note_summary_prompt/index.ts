// src/features/note_analysis/services/kpt_prompt/index.ts

import type { Lang } from 'src/i18n/types';
import { i18n } from 'src/i18n';
import { buildNoteSummaryExportPromptJa } from './ja';
import { buildNoteSummaryExportPromptEn } from './en';

export function buildNoteSummaryExportPrompt(lang?: Lang): string {
  const resolvedLang: Lang = lang ?? i18n.lang ?? 'ja';

  switch (resolvedLang) {
    case 'en':
      return buildNoteSummaryExportPromptEn();
    case 'ja':
    default:
      return buildNoteSummaryExportPromptJa();
  }
}
