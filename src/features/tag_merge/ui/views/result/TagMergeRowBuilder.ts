// src/features/tag_merge/ui/views/result/TagMergeRowBuilder.ts

import { App } from 'obsidian';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { TargetTagEditorDialog } from 'src/core/ui/tags/TargetTagEditorDialog';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagMergeRowVM } from 'src/features/tag_merge/models/viewmodels/TagMergeRowVM';

export class TagMergeRowBuilder {
  constructor(
    private readonly app: App,
    private readonly tagSuggestionService: TagSuggestionService,
  ) {}

  render(
    container: HTMLElement,
    row: TagMergeRowVM,
    options?: {
      onToggle?: (checked: boolean) => void;
    },
  ): void {
    const el = container.createDiv({ cls: 'tag-merge-row' });

    const cb = el.createEl('input', { type: 'checkbox' });
    cb.checked = row.checked;

    if (options?.onToggle) {
      cb.addEventListener('change', () => {
        options.onToggle!(cb.checked);
      });
    }

    if (this.isSameFromTo(row)) {
      this.renderToOnly(el, row);
    } else {
      this.renderFromTo(el, row);
    }
  }

  private isSameFromTo(row: TagMergeRowVM): boolean {
    return row.from === row.to;
  }

  private renderToOnly(el: HTMLElement, row: TagMergeRowVM): void {
    const toLink = el.createEl('a', {
      text: `${row.to}(${row.fromStat.count})`,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(row.to);
    });
  }

  private renderFromTo(el: HTMLElement, row: TagMergeRowVM): void {
    el.createSpan({
      text: `${row.from}(${row.fromStat.count})`,
      cls: 'tag-merge-from',
    });

    el.createSpan({ text: ' → ', cls: 'tag-merge-arrow' });

    const toLink = el.createEl('a', {
      text: row.to,
      href: '#',
      cls: 'tag-merge-to-link',
    });

    toLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openTagEditDialog(row.to);
    });
  }

  private openTagEditDialog(to: string): void {
    logger.debug(`[TagMergeRowBuilder] open edit dialog to=${to}`);

    new TargetTagEditorDialog(this.app, {
      state: { initialInput: to },
      search: this.tagSuggestionService,
      result: {
        confirm: async () => {},
      },
    }).open();
  }
}
