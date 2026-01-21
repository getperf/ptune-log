// src/features/tag_merge/services/TagMergeClusterBuilder.ts

import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { TagMergeCluster } from '../models/TagMergeCluster';
import { TagMergePriorityResolver } from './TagMergePriorityResolver';

export class TagMergeClusterBuilder {
  constructor(
    private readonly statResolver: TagStatResolver,
    private readonly priorityResolver: TagMergePriorityResolver,
  ) { }

  build(clusters: TagCluster[]): TagMergeCluster[] {
    const results: TagMergeCluster[] = [];

    for (const cluster of clusters) {
      const toKey = cluster.representative.key;
      const toStat = this.statResolver.resolve(toKey);
      const clusterSize = cluster.members.length;

      for (const member of cluster.members) {
        const fromKey = member.key;
        const fromStat = this.statResolver.resolve(fromKey);

        const priority = this.priorityResolver.resolve(
          clusterSize,
          toKey,
          fromKey,
        );

        results.push({
          to: toStat,
          priority,
          members: [
            {
              tag: fromStat,
            },
          ],
        });
      }
    }

    return results;
  }
}
