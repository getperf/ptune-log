// src/features/tag_merge/ui/TagMergeResultView.ts

import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';
import { TargetTagEditorDialog } from 'src/core/ui/tags/TargetTagEditorDialog';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { App } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagMergePriorityTabs } from './TagMergePriorityTabs';

/**
 * TagMergeResultView
 * - 埋め込み可能な純 View
 * - DOM に直接描画する
 */
export class TagMergeResultView {
  private activePriorityGroup: TagMergePriorityGroupVM;

  constructor(
    private readonly app: App,
    private readonly priorityGroups: TagMergePriorityGroupVM[],
    private readonly tagSuggestionService: TagSuggestionService,
  ) {
    this.activePriorityGroup = priorityGroups[0];
  }

  render(container: HTMLElement): void {
    container.empty();
    container.addClass('tag-merge-result-view');

    // --- Tabs ---
    const tabsEl = container.createDiv();
    new TagMergePriorityTabs(this.priorityGroups, (pg) => {
      this.activePriorityGroup = pg;
      this.renderBody(bodyEl);
    }).render(tabsEl);

    // --- Body ---
    const bodyEl = container.createDiv({ cls: 'tag-merge-result-body' });
    this.renderBody(bodyEl);

    logger.debug(
      `[TagMergeResultView] priorityGroups=${this.priorityGroups.length}`,
    );
  }

  private renderBody(container: HTMLElement): void {
    container.empty();
    this.renderPriorityGroup(container, this.activePriorityGroup);
  }

  // --- 以下は既存コードを一切変更せず流用 ---

  private renderPriorityGroup(
    container: HTMLElement,
    pg: TagMergePriorityGroupVM,
  ): void {
    if (pg.groups.length === 0) {
      container.createEl('p', {
        text: '対象なし',
        cls: 'tag-merge-empty',
      });
      return;
    }

    for (const group of pg.groups) {
      this.renderGroup(container, group);
    }
  }

  private renderGroup(
    container: HTMLElement,
    group: TagMergePriorityGroupVM['groups'][number],
  ): void {
    const groupEl = container.createDiv({ cls: 'tag-merge-group' });

    const header = groupEl.createDiv({ cls: 'tag-merge-group-header' });

    const cb = header.createEl('input', { type: 'checkbox' });
    cb.checked = group.checked;

    const toLink = header.createEl('a', {
      text: `To: ${group.to}`,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(group.to);
    });

    const list = groupEl.createDiv({ cls: 'tag-merge-group-list' });

    for (const item of group.items) {
      this.renderRow(list, item);
    }
  }

  private renderRow(
    container: HTMLElement,
    item: TagMergePriorityGroupVM['groups'][number]['items'][number],
  ): void {
    const row = container.createDiv({ cls: 'tag-merge-row' });

    const cb = row.createEl('input', { type: 'checkbox' });
    cb.checked = item.checked;

    row.createSpan({ text: item.from, cls: 'tag-merge-from' });
    row.createSpan({ text: ' → ', cls: 'tag-merge-arrow' });

    const toLink = row.createEl('a', {
      text: item.to,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(item.to);
    });
  }

  private openTagEditDialog(to: string): void {
    logger.debug(`[TagMergeResultView] open edit dialog to=${to}`);

    new TargetTagEditorDialog(this.app, {
      state: { initialInput: to },
      search: this.tagSuggestionService,
      result: {
        confirm: async () => { },
      },
    }).open();
  }
}
