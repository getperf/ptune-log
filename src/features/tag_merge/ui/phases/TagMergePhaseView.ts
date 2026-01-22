// src/features/tag_merge/ui/phases/TagMergePhaseView.ts

export abstract class TagMergePhaseView {
  /** ===== 必須（フェーズ固有） ===== */
  abstract getTitle(): string;

  getDescription(): { summary: string; steps?: string[] } | undefined {
    return undefined;
  }

  getStatusMessage(): string | undefined {
    return undefined;
  }

  /** フェーズ固有の描画 */
  protected abstract renderBody(container: HTMLElement): void;
  protected abstract renderActions(container: HTMLElement): void;

  /** ===== 共通描画フロー ===== */
  render(container: HTMLElement): void {
    container.empty();

    // Header
    container.createEl('h3', { text: this.getTitle() });

    const desc = this.getDescription();
    if (desc) {
      container.createEl('p', { text: desc.summary });
      if (desc.steps?.length) {
        const ul = container.createEl('ul');
        desc.steps.forEach((s) => ul.createEl('li', { text: s }));
      }
    }

    // Body
    const body = container.createDiv({ cls: 'tag-merge-phase-body' });
    this.renderBody(body);

    // Status
    const status = this.getStatusMessage();
    if (status) {
      container.createEl('div', {
        cls: 'tag-merge-phase-status',
        text: status,
      });
    }

    // Actions
    const actions = container.createDiv({ cls: 'tag-merge-phase-actions' });
    this.renderActions(actions);
  }
}
