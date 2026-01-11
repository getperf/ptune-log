// File: src/config/settings/ReviewSettings.ts
export interface ReviewSettings {
  /** 共通タグ抽出を実行するか */
  enableCommonTag: boolean;

  /** デイリーノートのユーザレビュー更新を有効にするか */
  enableDailyNoteUserReview: boolean;
}

export const DEFAULT_REVIEW_SETTINGS: ReviewSettings = {
  enableCommonTag: false,
  enableDailyNoteUserReview: true,
};
