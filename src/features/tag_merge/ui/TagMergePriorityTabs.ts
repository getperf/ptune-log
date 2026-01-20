// src/features/tag_merge/ui/TagMergePriorityTabs.ts

import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';
import { TAG_MERGE_PRIORITIES } from '../models/TagMergePriority';

export class TagMergePriorityTabs {
  private activePriority: TagMergePriorityGroupVM;

  constructor(
    private readonly priorityGroups: TagMergePriorityGroupVM[],
    private readonly onSelect: (pg: TagMergePriorityGroupVM) => void,
  ) {
    this.activePriority = priorityGroups[0];
  }

  render(container: HTMLElement): void {
    container.empty();
    container.addClass('tag-merge-priority-tabs');

    for (const pg of this.priorityGroups) {
      const meta = TAG_MERGE_PRIORITIES.get(pg.priority);

      const tab = container.createDiv({
        cls: 'tag-merge-priority-tab',
        text: meta?.labelKey ?? pg.priority,
      });

      if (pg === this.activePriority) {
        tab.addClass('is-active');
      }

      tab.onclick = () => {
        if (this.activePriority === pg) return;

        this.activePriority = pg;
        this.render(container);
        this.onSelect(pg);
      };
    }
  }
}
