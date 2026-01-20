// src/features/tag_merge/ui/phases/PrepareClusteringView.ts

import { TagMergePhaseView } from './TagMergePhaseView';
import { Setting } from 'obsidian';

export class PrepareClusteringView implements TagMergePhaseView {
  private status: string | undefined = '準備中';

  constructor(
    private readonly onRunClustering: () => Promise<void>,
    private readonly onCancel: () => void,
  ) {}

  getTitle(): string {
    return 'タグの名寄せ候補抽出（タグクラスタリング）';
  }

  getDescription() {
    return {
      summary: 'タグの名寄せ候補自動検出',
      steps: [],
    };
  }

  renderBody(container: HTMLElement): void {
    container.createEl('p', {
      text: 'クラスタ分析を実行してください。',
    });
  }

  getStatusMessage(): string | undefined {
    return this.status;
  }

  renderActions(container: HTMLElement): void {
    const setting = new Setting(container);
    setting.settingEl.addClass('tag-merge-actions'); // 右揃え用

    setting
      .addButton((btn) =>
        btn
          .setButtonText('クラスタ分析を実行')
          .setCta()
          .onClick(async () => {
            this.status = 'クラスタリング実行中…';
            await this.onRunClustering();
          }),
      )
      .addButton((btn) =>
        btn.setButtonText('キャンセル').onClick(() => {
          this.onCancel();
        }),
      );
  }
}
