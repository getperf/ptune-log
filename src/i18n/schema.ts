// File: src/i18n/schema.ts

import { DailyNoteSectionKey } from "src/core/models/daily_notes/DailyNoteSectionKey";

// import { DailyNoteSectionKey } from "src/core/models/daily_notes/DailyNoteSection";
// schema.ts

/**
 * i18n 辞書の「構造のみ」を定義する型
 * 値（文字列内容）は言語ごとに自由
 */

export interface CommonI18n {
  language: {
    name: string;
    desc: string;
    options: {
      ja: string;
      en: string;
    };
  };
}

export interface SettingsI18n {
  basic: {
    heading: string;
  };

  logLevel: {
    name: string;
    desc: string;
    options: {
      debug: string;
      info: string;
      warn: string;
      error: string;
      none: string;
    };
  };

  enableLogFile: {
    name: string;
    desc: string;
  };
}

export interface SettingsGoogleAuthI18n {
  sectionTitle: string;

  useWinApp: {
    name: string;
    desc: string;
  };

  clientId: {
    name: string;
    desc: string;
    placeholder: string;
  };

  clientSecret: {
    name: string;
    desc: string;
    placeholder: string;
  };
}

export interface SettingsNoteI18n {
  sectionTitle: string;

  folderPrefix: {
    name: string;
    desc: string;
    options: {
      serial: string;
      date: string;
    };
  };

  notePrefix: {
    name: string;
    desc: string;
    options: {
      serial: string;
      date: string;
    };
  };

  prefixDigits: {
    name: string;
    desc: string;
  };

  template: {
    name: string;
    desc: string;
    placeholder: string;
  };
}

export interface SettingsSnippetI18n {
  snippetFile: {
    name: string;
    desc: string;
    placeholder: string;
  };
}

export interface SettingsLlmI18n {
  sectionTitle: string;

  provider: {
    name: string;
    desc: string;
    options: Record<string, string>;
  };

  apiKey: {
    name: string;
    desc: string;
    placeholder: string;
  };

  baseUrl: {
    name: string;
    desc: string;
  };

  model: {
    name: string;
    desc: string;
  };

  embeddingModel: {
    name: string;
    desc: string;
    options: Record<string, string>;
  };

  temperature: {
    name: string;
    desc: string;
  };

  maxTokens: {
    name: string;
    desc: string;
    placeholder: string;
  };

  minSimilarityScore: {
    name: string;
    desc: string;
  };

  enableChecklist: {
    name: string;
    desc: string;
  };

  promptTemplate: {
    name: string;
    desc: (notePath: string) => string;
    buttons: {
      select: string;
      open: string;
    };
    noticeNotFound: (notePath: string) => string;
  };

  promptPreview: {
    name: string;
    desc: string;
    button: string;
    noticeOpen: string;
    noticeFail: string;
  };
}

export interface SettingsReviewI18n {
  sectionTitle: string;
  enableCommonTag: {
    name: string;
    desc: string;
  };
}

export interface DailyNoteSectionI18n {
  planned_tasks: string;
  task_review: string;
  daily_report: string;
  kpt: string;
}

export interface LlmTagGenerateI18n {
  apiKeyMissing: string;
  noMarkdownFiles: string;
  reviewCompleted: string;
}

export interface NoteSummaryMarkdownI18n {
  goalLabel: string;          // 例: "目標"
  userReviewHeading: string;  // 例: "ユーザレビュー"
  emptyBullet: string;        // 例: "-"
}


export interface I18nDict {
  common: CommonI18n;
  settings: SettingsI18n;
  settingsGoogleAuth: SettingsGoogleAuthI18n;
  settingsNote: SettingsNoteI18n;
  settingsSnippet: SettingsSnippetI18n;
  settingsLlm: SettingsLlmI18n;
  settingsReview: SettingsReviewI18n;
  llmTagGenerate: LlmTagGenerateI18n;
  noteSummaryMarkdown: NoteSummaryMarkdownI18n;
  dailyNoteSections: Record<DailyNoteSectionKey, string>;
}
