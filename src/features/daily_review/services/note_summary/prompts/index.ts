// src/features/daily_review/services/note_summary/prompts/index.ts

import { SENTENCE_SUMMARY_SYSTEM_PROMPT_JA } from './ja';
import { SENTENCE_SUMMARY_SYSTEM_PROMPT_EN } from './en';

export type NoteSummaryPromptLang = 'ja' | 'en';

export function getSentenceSummarySystemPrompt(
  lang: NoteSummaryPromptLang,
): string {
  return lang === 'en'
    ? SENTENCE_SUMMARY_SYSTEM_PROMPT_EN
    : SENTENCE_SUMMARY_SYSTEM_PROMPT_JA;
}
