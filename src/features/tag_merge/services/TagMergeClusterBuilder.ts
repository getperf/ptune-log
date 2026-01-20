// src/features/tag_merge/services/TagMergeClusterBuilder.ts

import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagMergeCluster } from '../models/TagMergeCluster';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { TagMergePriorityResolver } from './TagMergePriorityResolver';
import { HierarchyPriorityDetector } from './detectors/HierarchyPriorityDetector';
import { VariantPriorityDetector } from './detectors/VariantPriorityDetector';
import { TagMergePriorityKey } from '../models/TagMergePriority';

export class TagMergeClusterBuilder {
  private readonly priorityResolver = new TagMergePriorityResolver(
    [
      new HierarchyPriorityDetector(),
      new VariantPriorityDetector(),
    ]
  );

  constructor(private readonly statResolver: TagStatResolver) { }

  build(clusters: TagCluster[]): TagMergeCluster[] {
    // toKey -> priority -> TagMergeCluster
    const grouped = new Map<string, Map<TagMergePriorityKey, TagMergeCluster>>();

    for (const cluster of clusters) {
      const toKey = cluster.representative.key;
      const toStat = this.statResolver.resolve(toKey);

      for (const member of cluster.members) {
        const fromKey = member.key;
        if (fromKey === toKey) continue;

        const priority = this.priorityResolver.resolve(toKey, fromKey);

        let byPriority = grouped.get(toKey);
        if (!byPriority) {
          byPriority = new Map();
          grouped.set(toKey, byPriority);
        }

        let mergeCluster = byPriority.get(priority);
        if (!mergeCluster) {
          mergeCluster = {
            to: toStat,
            priority,
            members: [],
          };
          byPriority.set(priority, mergeCluster);
        }

        mergeCluster.members.push({
          tag: this.statResolver.resolve(fromKey),
        });
      }
    }

    // Map → 配列へ変換
    return Array.from(grouped.values()).flatMap((m) =>
      Array.from(m.values())
    );
  }
}
