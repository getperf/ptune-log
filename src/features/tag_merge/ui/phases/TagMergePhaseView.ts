// src/features/tag_merge/ui/phases/TagMergePhaseView.ts

export interface TagMergePhaseView {
  /** タイトル文字列 */
  getTitle(): string;

  /** 説明文（未表示なら undefined） */
  getDescription():
    | {
        summary: string;
        steps?: string[];
      }
    | undefined;

  /** ボディ描画 */
  renderBody(container: HTMLElement): void;

  /** ステータス文言（未表示なら undefined） */
  getStatusMessage(): string | undefined;

  /** ボタン描画 */
  renderActions(container: HTMLElement): void;
}
