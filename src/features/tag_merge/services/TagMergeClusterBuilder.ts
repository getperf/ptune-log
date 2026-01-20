// src/features/tag_merge/services/TagMergeClusterBuilder.ts

import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagMergeCluster } from '../models/TagMergeCluster';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { TagMergePriorityResolver } from './TagMergePriorityResolver';
import { HierarchyPriorityDetector } from './detectors/HierarchyPriorityDetector';
import { VariantPriorityDetector } from './detectors/VariantPriorityDetector';

export class TagMergeClusterBuilder {
  private readonly priorityResolver = new TagMergePriorityResolver([
    new HierarchyPriorityDetector(),
    new VariantPriorityDetector(),
  ]);

  constructor(private readonly statResolver: TagStatResolver) {}

  build(clusters: TagCluster[]): TagMergeCluster[] {
    const results: TagMergeCluster[] = [];

    for (const cluster of clusters) {
      const toKey = cluster.representative.key;

      for (const member of cluster.members) {
        const fromKey = member.key;

        // 同一行は除外
        if (fromKey === toKey) continue;

        results.push({
          to: this.statResolver.resolve(toKey),
          priority: this.priorityResolver.resolve(toKey, fromKey),
          members: [
            {
              tag: this.statResolver.resolve(fromKey),
            },
          ],
        });
      }
    }

    return results;
  }
}
