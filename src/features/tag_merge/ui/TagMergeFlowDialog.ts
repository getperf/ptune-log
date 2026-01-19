// src/features/tag_merge/ui/TagMergeFlowDialog.ts

import { App, Modal } from 'obsidian';
import { TagMergePhase } from '../models/TagMergePhase';
import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';
import { TagMergeResultDialog } from './TagMergeResultDialog';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { i18n } from 'src/i18n';

export class TagMergeFlowDialog extends Modal {
  private phase: TagMergePhase = 'prepare';
  private priorityGroups: TagMergePriorityGroupVM[] = [];

  constructor(
    app: App,
    private readonly onRunClustering: () => Promise<void>,
    private readonly onRunTagMerge: () => Promise<void>, // 将来用（今は未実装）
    private readonly tagSuggestionService: TagSuggestionService,
  ) {
    super(app);
  }

  onOpen(): void {
    this.render();
  }

  setPhase(phase: TagMergePhase): void {
    this.phase = phase;
    this.render();
  }

  setReviewResult(priorityGroups: TagMergePriorityGroupVM[]): void {
    this.priorityGroups = priorityGroups;
    this.setPhase('reviewMerge');
  }

  setComplete(): void {
    this.setPhase('complete');
  }

  private render(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('tag-merge-flow-modal');

    // Phase heading
    contentEl.createEl('h2', {
      text: i18n.ui.tagMerge.phase[this.phase],
    });

    switch (this.phase) {
      case 'prepare':
        this.renderPrepare(contentEl);
        break;

      case 'clustering':
        this.renderClustering(contentEl);
        break;

      case 'reviewMerge':
        this.renderReview(contentEl);
        break;

      case 'updateMerge':
        this.renderUpdateMerge(contentEl);
        break;

      case 'complete':
        this.renderComplete(contentEl);
        break;
    }
  }

  private renderPrepare(container: HTMLElement): void {
    const btn = container.createEl('button', {
      text: i18n.ui.tagMerge.action.runClustering,
    });

    btn.addEventListener('click', () => {
      void this.onRunClustering();
    });
  }

  private renderClustering(container: HTMLElement): void {
    container.createEl('p', {
      text: i18n.ui.tagMerge.status.clustering,
    });
  }

  private renderReview(container: HTMLElement): void {
    // 結果表示（既存 Dialog を流用）
    new TagMergeResultDialog(
      this.app,
      this.priorityGroups,
      this.tagSuggestionService,
    ).open();

    const btn = container.createEl('button', {
      text: i18n.ui.tagMerge.action.runTagMerge,
    });

    btn.addEventListener('click', () => {
      void this.onRunTagMerge();
    });
  }

  private renderUpdateMerge(container: HTMLElement): void {
    container.createEl('p', {
      text: i18n.ui.tagMerge.status.mergePending,
    });
  }

  private renderComplete(container: HTMLElement): void {
    container.createEl('p', {
      text: i18n.ui.tagMerge.phase.complete,
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
