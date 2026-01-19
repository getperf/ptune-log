// src/features/tag_merge/ui/phases/TagMergePhaseView.ts

export interface TagMergePhaseView {
  /** タイトル文字列 */
  getTitle(): string;

  /** ボディ描画 */
  renderBody(container: HTMLElement): void;

  /** ステータス文言（未表示なら undefined） */
  getStatusMessage(): string | undefined;

  /** ボタン描画 */
  renderActions(container: HTMLElement): void;
}
