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

    // 2. 説明文（任意）
    const desc = this.currentView.getDescription();
    if (desc) {
      const descEl = contentEl.createDiv({
        cls: 'tag-merge-description',
      });

      descEl.createEl('p', {
        text: desc.summary,
        cls: 'tag-merge-description-summary',
      });

      if (desc.steps && desc.steps.length > 0) {
        const ul = descEl.createEl('ul', {
          cls: 'tag-merge-description-steps',
        });
        for (const step of desc.steps) {
          ul.createEl('li', { text: step });
        }
      }
    }

    // 3. ボディ
    const body = contentEl.createDiv({ cls: 'tag-merge-body' });
    this.currentView.renderBody(body);

    // 4. ステータスバー
    const statusMessage = this.currentView.getStatusMessage();
    if (statusMessage) {
      contentEl.createDiv({
        cls: 'tag-merge-status',
        text: statusMessage,
      });
    }

    // 5. ボタン
    const actions = contentEl.createDiv({
      cls: 'tag-merge-actions',
    });
    this.currentView.renderActions(actions);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
