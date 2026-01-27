// src/features/tag_merge/services/tag_rename/RenameCandidateExtractor.ts

import { App, Modal, Notice } from 'obsidian';
import { RenameCandidateRow } from './models/RenameCandidateRow';
import { TagMergePriorityGroupVM } from '../../models/viewmodels/TagMergePriorityGroupVM';

class RenameCandidateDebugModal extends Modal {
  constructor(
    app: App,
    private readonly jsonText: string,
  ) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    // --- Header ---
    const header = contentEl.createDiv({ cls: 'rename-debug-header' });
    header.createEl('h3', { text: 'Rename Candidates (Debug)' });

    // --- Copy button ---
    const copyBtn = header.createEl('button', {
      text: 'Copy to Clipboard',
    });
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(this.jsonText);
        new Notice('Copied to clipboard');
      } catch {
        new Notice('Failed to copy to clipboard');
      }
    });

    // --- JSON body ---
    const pre = contentEl.createEl('pre');
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.maxHeight = '60vh';
    pre.style.overflowY = 'auto';
    pre.setText(this.jsonText);
  }
}

export class RenameCandidateExtractor {
  constructor(private readonly app: App) {}

  extract(
    priorityGroups: TagMergePriorityGroupVM[],
    opts?: {
      debug?: boolean;
    },
  ): RenameCandidateRow[] {
    const candidates: RenameCandidateRow[] = [];

    for (const priorityGroup of priorityGroups) {
      const priority = priorityGroup.priority;

      for (const group of priorityGroup.groups) {
        const to = group.to;

        for (const row of group.rows) {
          if (!row.checked) continue;
          if (row.isSelf()) continue;

          candidates.push({
            from: row.from,
            to,
            priority,
          });
        }
      }
    }

    if (opts?.debug) {
      const json = JSON.stringify(candidates, null, 2);
      new RenameCandidateDebugModal(this.app, json).open();
    }

    return candidates;
  }
}
