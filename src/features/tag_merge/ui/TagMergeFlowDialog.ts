// src/features/tag_merge/ui/TagMergeFlowDialog.ts

import { App, Modal } from 'obsidian';
import { TagMergePhaseView } from './phases/TagMergePhaseView';

export class TagMergeFlowDialog extends Modal {
  private currentView!: TagMergePhaseView;

  constructor(app: App) {
    super(app);
  }

  onOpen(): void {
    this.render();
  }

  setPhaseView(view: TagMergePhaseView): void {
    this.currentView = view;
    this.render();
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('tag-merge-flow-modal');

    // 1. タイトル
    contentEl.createEl('h2', {
      text: this.currentView.getTitle(),
    });

    // 2. ボディ
    const body = contentEl.createDiv({ cls: 'tag-merge-body' });
    this.currentView.renderBody(body);

    // 3. ステータスバー
    const statusMessage = this.currentView.getStatusMessage();
    if (statusMessage) {
      contentEl.createDiv({
        cls: 'tag-merge-status',
        text: statusMessage,
      });
    }

    // 4. ボタン
    const actions = contentEl.createDiv({
      cls: 'tag-merge-actions',
    });
    this.currentView.renderActions(actions);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
