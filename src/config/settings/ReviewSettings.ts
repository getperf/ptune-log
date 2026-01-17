// File: src/config/settings/ReviewSettings.ts

export type KptOutputMode = 'markdown' | 'text';

export interface ReviewSettings {
  /** 共通タグ抽出を実行するか */
  enableCommonTag: boolean;

  /** デイリーノートのユーザレビュー更新を有効にするか */
  enableDailyNoteUserReview: boolean;

  /** KPT 出力形式 */
  kptOutputMode: KptOutputMode;
}

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  enableCommonTag: false,
  enableDailyNoteUserReview: true,
  kptOutputMode: 'markdown',
};
