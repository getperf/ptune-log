// File: src/i18n/index.ts

export type { I18nDict } from './schema';
export type { Lang } from './types';

import type { I18nDict } from './schema';
import type { Lang } from './types';

import { I18nService } from './I18nService';

// ★ シングルトンをここで生成
export const i18n = new I18nService();

/* --- 辞書 imports（省略せずそのまま） --- */
import { commonJa } from './ja/common';
import { commonEn } from './en/common';
import { settingsJa } from './ja/settings';
import { settingsEn } from './en/settings';
import { settingsGoogleAuthJa } from './ja/settings_google_auth';
import { settingsGoogleAuthEn } from './en/settings_google_auth';
import { settingsNoteJa } from './ja/settings_note';
import { settingsNoteEn } from './en/settings_note';
import { settingsSnippetJa } from './ja/settings_snippet';
import { settingsSnippetEn } from './en/settings_snippet';
import { settingsLlmJa } from './ja/settings_llm';
import { settingsLlmEn } from './en/settings_llm';
import { settingsReviewJa } from './ja/settings_review';
import { settingsReviewEn } from './en/settings_review';
import { DAILY_NOTE_SECTION_LABELS_JA } from './ja/daily_note_sections';
import { llmTagGenerateJa } from './ja/llm_tag_generate';
import { llmTagGenerateEn } from './en/llm_tag_generate';
import { noteSummaryMarkdownJa } from './ja/note_summary_markdown';
import { noteSummaryMarkdownEn } from './en/note_summary_markdown';
import { DAILY_NOTE_SECTION_LABELS_EN } from './en/daily_note_sections';

/* --- 辞書本体 --- */
const dict: Record<Lang, I18nDict> = {
  ja: {
    common: commonJa,
    settings: settingsJa,
    settingsGoogleAuth: settingsGoogleAuthJa,
    settingsNote: settingsNoteJa,
    settingsSnippet: settingsSnippetJa,
    settingsLlm: settingsLlmJa,
    settingsReview: settingsReviewJa,
    dailyNoteSections: DAILY_NOTE_SECTION_LABELS_JA,
    llmTagGenerate: llmTagGenerateJa,
    noteSummaryMarkdown: noteSummaryMarkdownJa,
  },
  en: {
    common: commonEn,
    settings: settingsEn,
    settingsGoogleAuth: settingsGoogleAuthEn,
    settingsNote: settingsNoteEn,
    settingsSnippet: settingsSnippetEn,
    settingsLlm: settingsLlmEn,
    settingsReview: settingsReviewEn,
    dailyNoteSections: DAILY_NOTE_SECTION_LABELS_EN,
    llmTagGenerate: llmTagGenerateEn,
    noteSummaryMarkdown: noteSummaryMarkdownEn,
  },
};

export function getI18n(lang: Lang): I18nDict {
  return dict[lang] ?? dict.ja;
}

export const dailyNoteSectionLabels = {
  ja: DAILY_NOTE_SECTION_LABELS_JA,
};
