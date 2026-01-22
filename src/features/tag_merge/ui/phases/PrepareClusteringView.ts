// src/features/tag_merge/ui/phases/PrepareClusteringView.ts

import { Setting } from 'obsidian';
import { TagMergePhaseView } from './TagMergePhaseView';
import { TagMergeClusteringOptions } from '../../models/TagMergeClusteringOptions';

export class PrepareClusteringView extends TagMergePhaseView {
  private unregisteredOnly: boolean;

  constructor(
    private readonly onRun: (
      options: TagMergeClusteringOptions,
    ) => Promise<void>,
    private readonly onCancel: () => void,
    private readonly messages: string[],
    initialOptions: TagMergeClusteringOptions,
  ) {
    super();
    this.unregisteredOnly = initialOptions.exclusion.unregisteredOnly;
  }

  getTitle(): string {
    return 'クラスタリング準備';
  }

  getDescription() {
    return {
      summary: '差分を確認し、クラスタリング条件を指定します。',
    };
  }

  protected renderBody(container: HTMLElement): void {
    new Setting(container)
      .setName('未登録タグのみを対象にする')
      .setDesc('Tag DB に未登録のタグのみをクラスタリング対象にします')
      .addToggle((t) =>
        t.setValue(this.unregisteredOnly).onChange((v) => {
          this.unregisteredOnly = v;
        }),
      );

    for (const msg of this.messages) {
      container.createEl('div', { text: msg });
    }
  }

  protected renderActions(container: HTMLElement): void {
    new Setting(container)
      .addButton((btn) =>
        btn
          .setButtonText('クラスタリング実行')
          .setCta()
          .onClick(async () => {
            await this.onRun(this.buildOptions());
          }),
      )
      .addButton((btn) =>
        btn.setButtonText('キャンセル').onClick(this.onCancel),
      );
  }

  private buildOptions(): TagMergeClusteringOptions {
    return {
      k: 600,
      iterations: 5,
      exclusion: { unregisteredOnly: this.unregisteredOnly },
      priority: { largeClusterThreshold: 10 },
    };
  }
}
