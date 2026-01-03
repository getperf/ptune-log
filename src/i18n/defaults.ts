import { DailyNoteSectionKey } from 'src/core/models/daily_notes/DailyNoteSectionKey';
import type { I18nDict } from './schema';

export const DEFAULT_I18N_DICT: I18nDict = {
  common: {
    language: {
      name: 'Language',
      desc: 'UI language',
      options: {
        ja: 'Japanese',
        en: 'English',
      },
    },
  },

  settings: {
    basic: {
      heading: '',
    },
    logLevel: {
      name: '',
      desc: '',
      options: {
        debug: '',
        info: '',
        warn: '',
        error: '',
        none: '',
      },
    },
    enableLogFile: {
      name: '',
      desc: '',
    },
  },

  settingsGoogleAuth: {
    sectionTitle: '',
    useWinApp: { name: '', desc: '' },
    clientId: { name: '', desc: '', placeholder: '' },
    clientSecret: { name: '', desc: '', placeholder: '' },
  },

  settingsNote: {
    sectionTitle: '',
    folderPrefix: {
      name: '',
      desc: '',
      options: { serial: '', date: '' },
    },
    notePrefix: {
      name: '',
      desc: '',
      options: { serial: '', date: '' },
    },
    prefixDigits: { name: '', desc: '' },
    template: { name: '', desc: '', placeholder: '' },
  },

  settingsSnippet: {
    snippetFile: { name: '', desc: '', placeholder: '' },
  },

  settingsLlm: {
    sectionTitle: '',
    provider: { name: '', desc: '', options: {} },
    apiKey: { name: '', desc: '', placeholder: '' },
    baseUrl: { name: '', desc: '' },
    model: { name: '', desc: '' },
    embeddingModel: { name: '', desc: '', options: {} },
    temperature: { name: '', desc: '' },
    maxTokens: { name: '', desc: '', placeholder: '' },
    minSimilarityScore: { name: '', desc: '' },
    enableChecklist: { name: '', desc: '' },
    promptTemplate: {
      name: '',
      desc: () => '',
      buttons: { select: '', open: '' },
      noticeNotFound: () => '',
    },
    promptPreview: {
      name: '',
      desc: '',
      button: '',
      noticeOpen: '',
      noticeFail: '',
    },
  },

  settingsReview: {
    sectionTitle: '',
    enableCommonTag: { name: '', desc: '' },
  },

  llmTagGenerate: {
    apiKeyMissing: '',
    noMarkdownFiles: '',
    reviewCompleted: '',
  },

  noteSummaryMarkdown: {
    goalLabel: '',
    userReviewHeading: '',
    emptyBullet: '-',
  },

  dailyNoteSections: {
    [DailyNoteSectionKey.PlannedTasks]: 'PlannedTasks',
    [DailyNoteSectionKey.TimeLog]: 'TimeLog',
    [DailyNoteSectionKey.ReviewMemo]: 'Review',          // ★ 修正
    [DailyNoteSectionKey.DailyReport]: 'DailyReport',
    [DailyNoteSectionKey.TagList]: 'TagList',
    [DailyNoteSectionKey.Kpt]: 'Kpt',
    [DailyNoteSectionKey.TimeAnalysisSummary]: 'TimeAnalysisSummary',
    [DailyNoteSectionKey.Backlog]: 'Backlog',
    [DailyNoteSectionKey.DeltaLarge]: 'DeltaLarge',
    [DailyNoteSectionKey.WorkTypeSummary]: 'WorkTypeSummary',
    [DailyNoteSectionKey.DailySummary]: 'DailySummary',
  },
};
