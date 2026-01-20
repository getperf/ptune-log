// src/features/tag_merge/ui/phases/ApplyMergeView.ts

import { Setting } from 'obsidian';
import { TagMergePhaseView } from './TagMergePhaseView';

export class ApplyMergeView implements TagMergePhaseView {
  private status = 'タグマージ準備中';

  constructor(private readonly onComplete: () => void) {}

  getTitle(): string {
    return 'タグマージ';
  }

  getDescription() {
    return {
      summary: 'タグマージ。',
    };
  }

  renderBody(_container: HTMLElement): void {
    // 表示なし
  }

  getStatusMessage(): string | undefined {
    return this.status;
  }

  renderActions(container: HTMLElement): void {
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
