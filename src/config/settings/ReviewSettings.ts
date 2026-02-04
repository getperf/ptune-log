// File: src/config/settings/ReviewSettings.ts

export type KptOutputMode = 'markdown' | 'text';

/** Sentence 要約モード */
export type SentenceMode = 'none' | 'llm';

/** ノート要約の出力形式 */
export type NoteSummaryOutputFormat = 'outliner' | 'xmind';

export interface ReviewSettings {
  /** 共通タグ抽出を実行するか */
  enableCommonTag: boolean;

  /** デイリーノートのユーザレビュー更新を有効にするか */
  enableDailyNoteUserReview: boolean;

  /** KPT 出力形式 */
  kptOutputMode: KptOutputMode;

  /** Sentence 要約モード */
  sentenceMode: SentenceMode;

  /** ノート要約出力形式 */
  noteSummaryOutputFormat: NoteSummaryOutputFormat;
}

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  enableCommonTag: false,
  enableDailyNoteUserReview: true,
  kptOutputMode: 'markdown',

  // --- defaults ---
  sentenceMode: 'llm',
  noteSummaryOutputFormat: 'xmind',
};
