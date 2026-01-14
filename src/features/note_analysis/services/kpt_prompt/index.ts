// src/features/note_analysis/services/kpt_prompt/index.ts

import type { Lang } from 'src/i18n/types';
import { i18n } from 'src/i18n';
import { buildKptSystemPromptJa } from './ja';
import { buildKptSystemPromptEn } from './en';

export function buildKptSystemPrompt(lang?: Lang): string {
  const resolvedLang: Lang = lang ?? i18n.lang ?? 'ja';

  switch (resolvedLang) {
    case 'en':
      return buildKptSystemPromptEn();
    case 'ja':
    default:
      return buildKptSystemPromptJa();
  }
}
