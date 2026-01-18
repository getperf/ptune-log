// src/features/tag_merge/ui/TagMergeResultDialog.ts
import { App, Modal } from 'obsidian';
import { TagMergeCluster } from '../models/TagMergeCluster';

export class TagMergeResultDialog extends Modal {
  constructor(app: App, private readonly clusters: TagMergeCluster[]) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Tag Merge (Clustering Result)' });

    this.clusters.forEach((cluster) => {
      contentEl.createEl('h3', {
        text: `→ ${cluster.to} (${cluster.members.length})`,
      });

      const ul = contentEl.createEl('ul');
      cluster.members.forEach((m) => {
        ul.createEl('li', {
          text: `${m.from}  (count=${m.count})`,
        });
      });
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
