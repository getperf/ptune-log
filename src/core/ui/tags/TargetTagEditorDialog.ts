// File: src/core/ui/tags/TargetTagEditorDialog.ts

import { App, Modal, ButtonComponent } from 'obsidian';
import { TagCandidate } from 'src/core/models/tags/TagCandidate';
import { TagCandidateRenderer } from './TagCandidateRenderer';
import {
  TargetTagSearchController,
  SearchMode,
} from './TargetTagSearchController';
import { logger } from 'src/core/services/logger/loggerInstance';

export interface TargetTagEditorOptions {
  initialText?: string;

  searchNormal: (q: string) => Promise<TagCandidate[]>;
  searchVector?: (q: string) => Promise<TagCandidate[]>;
  vectorAvailable: boolean;

  onConfirm: (tag: string) => Promise<void>;
}

export class TargetTagEditorDialog extends Modal {
  private inputEl!: HTMLInputElement;

  private listNormalEl!: HTMLElement;
  private listVectorEl!: HTMLElement;

  private tabNormalEl!: HTMLButtonElement;
  private tabVectorEl!: HTMLButtonElement;

  private activeTab: SearchMode = 'normal';
  private selectedTag: string | null = null;

  private normalRenderer!: TagCandidateRenderer;
  private vectorRenderer!: TagCandidateRenderer;

  private controller: TargetTagSearchController;

  constructor(app: App, private readonly opts: TargetTagEditorOptions) {
    super(app);
    this.controller = new TargetTagSearchController({
      searchNormal: opts.searchNormal,
      searchVector: opts.searchVector,
      vectorAvailable: opts.vectorAvailable,
    });
  }

  async onOpen(): Promise<void> {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h3', { text: 'Target Tag Editor' });

    // --- input ---
    this.inputEl = contentEl.createEl('input', {
      type: 'text',
      cls: 'tag-edit-input tag-edit-input-wide',
      value: this.opts.initialText ?? '',
      attr: { placeholder: 'タグを入力または候補から選択' },
    });

    this.inputEl.addEventListener('input', async (ev) => {
      const key = (ev.target as HTMLInputElement).value.trim();
      this.selectedTag = null;

      if (this.activeTab === 'normal') {
        const normal = await this.controller.search('normal', key);
        this.normalRenderer.render(normal);
      } else {
        const vector = await this.controller.search('vector', key);
        this.vectorRenderer.render(vector);
      }
    });

    // --- tabs ---
    const tabRow = contentEl.createEl('div', { cls: 'tag-rename-tabs' });

    this.tabNormalEl = tabRow.createEl('button', { text: '通常候補' });
    this.tabVectorEl = tabRow.createEl('button', { text: '類似候補' });

    this.tabNormalEl.classList.add('active');

    this.tabNormalEl.addEventListener('click', async () => {
      await this.switchTab('normal');
    });

    this.tabVectorEl.addEventListener('click', async () => {
      await this.switchTab('vector');
    });

    // --- candidate lists ---
    this.listNormalEl = contentEl.createEl('div', {
      cls: 'tag-candidate-list',
    });
    this.listVectorEl = contentEl.createEl('div', {
      cls: 'tag-candidate-list hidden',
    });

    this.normalRenderer = new TagCandidateRenderer(this.listNormalEl, (name) =>
      this.selectCandidate(name)
    );
    this.vectorRenderer = new TagCandidateRenderer(this.listVectorEl, (name) =>
      this.selectCandidate(name)
    );

    // --- buttons ---
    const btnRow = contentEl.createEl('div', { cls: 'tag-edit-buttons' });

    new ButtonComponent(btnRow)
      .setButtonText('Confirm')
      .setCta()
      .onClick(async () => {
        const value = this.selectedTag || this.inputEl.value.trim();
        if (!value) return;
        await this.opts.onConfirm(value);
        this.close();
      });

    new ButtonComponent(btnRow)
      .setButtonText('Cancel')
      .onClick(() => this.close());

    // --- initial normal search ---
    const initKey = this.opts.initialText ?? '';
    const initial = await this.controller.search('normal', initKey);
    this.normalRenderer.render(initial);
  }

  private async switchTab(tab: SearchMode): Promise<void> {
    if (this.activeTab === tab) return;

    this.activeTab = tab;

    // ★ active クラスを必ず同期
    this.tabNormalEl.classList.toggle('active', tab === 'normal');
    this.tabVectorEl.classList.toggle('active', tab === 'vector');

    this.listNormalEl.toggleClass('hidden', tab !== 'normal');
    this.listVectorEl.toggleClass('hidden', tab !== 'vector');

    const key = this.inputEl.value.trim();

    if (tab === 'normal') {
      const normal = await this.controller.search('normal', key);
      this.normalRenderer.render(normal);
    } else if (this.controller.canUseVector()) {
      const vector = await this.controller.search('vector', key);
      this.vectorRenderer.render(vector);
    }

    logger.debug(`[TargetTagEditorDialog] switchTab=${tab}`);
  }

  private selectCandidate(name: string): void {
    this.selectedTag = name;
    this.inputEl.value = name;
    logger.debug(`[TargetTagEditorDialog] selected=${name}`);
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
