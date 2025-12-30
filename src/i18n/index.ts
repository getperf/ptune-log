// File: src/i18n/index.ts

// --- public exports ---
export type { I18nDict } from './schema';
export type { Lang } from './types';

// --- internal imports ---
import type { I18nDict } from './schema';
import type { Lang } from './types';

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

import { dailyNoteSectionsJa } from './ja/daily_note_sections';
import { dailyNoteSectionsEn } from './en/daily_note_sections';

import { llmTagGenerateJa } from './ja/llm_tag_generate';
import { llmTagGenerateEn } from './en/llm_tag_generate';

import { noteSummaryMarkdownJa } from './ja/note_summary_markdown';
import { noteSummaryMarkdownEn } from './en/note_summary_markdown';

const dict: Record<Lang, I18nDict> = {
  ja: {
    common: commonJa,
    settings: settingsJa,
    settingsGoogleAuth: settingsGoogleAuthJa,
    settingsNote: settingsNoteJa,
    settingsSnippet: settingsSnippetJa,
    settingsLlm: settingsLlmJa,
    settingsReview: settingsReviewJa,
    dailyNoteSections: dailyNoteSectionsJa,
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
    dailyNoteSections: dailyNoteSectionsEn,
    llmTagGenerate: llmTagGenerateEn,
    noteSummaryMarkdown: noteSummaryMarkdownEn,
  },
};

/** 言語に応じた i18n 辞書を返す */
export function getI18n(lang: Lang): I18nDict {
  return dict[lang] ?? dict.ja;
}
