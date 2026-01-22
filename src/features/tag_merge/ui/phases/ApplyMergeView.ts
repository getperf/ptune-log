// src/features/tag_merge/ui/phases/ApplyMergeView.ts

import { Setting } from 'obsidian';
import { TagMergePhaseView } from './TagMergePhaseView';

export class ApplyMergeView extends TagMergePhaseView {
  private status = 'タグマージ準備中';

  constructor(private readonly onComplete: () => void) {
    super();
  }

  getTitle(): string {
    return 'タグマージ';
  }

  getDescription() {
    return {
      summary: 'タグマージを実行します。',
    };
  }

  getStatusMessage(): string | undefined {
    return this.status;
  }

  protected renderBody(_container: HTMLElement): void {
    // Apply フェーズでは本文表示なし
  }

  protected renderActions(container: HTMLElement): void {
    const setting = new Setting(container);
    setting.settingEl.addClass('tag-merge-actions');

    setting.addButton((btn) =>
      btn
        .setButtonText('完了')
        .setCta()
        .onClick(() => {
          this.onComplete();
        }),
    );
  }
}
