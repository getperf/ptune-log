// src/features/tag_merge/services/TagMergeViewModelBuilder.ts
import { TagMergeCluster } from '../models/TagMergeCluster';
import {
  TagMergePriorityKey,
  TAG_MERGE_PRIORITIES,
} from '../models/TagMergePriority';
import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';

export class TagMergeViewModelBuilder {
  build(clusters: TagMergeCluster[]): TagMergePriorityGroupVM[] {
    const bucket: Record<TagMergePriorityKey, TagMergePriorityGroupVM> = {
      hierarchy: { priority: 'hierarchy', active: false, groups: [] },
      variant: { priority: 'variant', active: false, groups: [] },
      similar: { priority: 'similar', active: false, groups: [] },
      other: { priority: 'other', active: false, groups: [] },
    };

    for (const cluster of clusters) {
      const priority = this.detectPriority(cluster);

      bucket[priority].groups.push({
        to: cluster.to,
        checked: true,
        items: cluster.members.map((m) => ({
          from: m.from,
          to: cluster.to,
          count: m.count,
          checked: true,
        })),
      });
    }

    // Record の場合は Object.values を使う（型が TagMergePriorityGroupVM[] に確定）
    return Object.values(bucket).sort(
      (a, b) => this.getOrder(a.priority) - this.getOrder(b.priority)
    );
  }

  private getOrder(priority: TagMergePriorityKey): number {
    return TAG_MERGE_PRIORITIES.get(priority)?.order ?? 999;
  }

  private detectPriority(cluster: TagMergeCluster): TagMergePriorityKey {
    const froms = cluster.members.map((m) => m.from);

    if (froms.some((f) => f.startsWith(cluster.to + '/'))) {
      return 'hierarchy';
    }

    if (froms.some((f) => this.isVariant(f, cluster.to))) {
      return 'variant';
    }

    return 'similar';
  }

  private isVariant(a: string, b: string): boolean {
    const normalize = (s: string) => s.replace(/[-_/]/g, '').toLowerCase();
    return normalize(a) === normalize(b);
  }
}
