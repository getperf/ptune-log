// src/features/tag_merge/services/TagMergeClusterBuilder.ts

import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { TagMergeCluster } from '../models/TagMergeCluster';
import { TagMergePriorityResolver } from './TagMergePriorityResolver';

type ClusterKey = string;

export class TagMergeClusterBuilder {
  constructor(
    private readonly statResolver: TagStatResolver,
    private readonly priorityResolver: TagMergePriorityResolver,
  ) {}

  build(clusters: TagCluster[]): TagMergeCluster[] {
    const grouped = new Map<ClusterKey, TagMergeCluster>();

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

        const key = this.buildGroupKey(toKey, priority);

        let group = grouped.get(key);
        if (!group) {
          group = {
            to: toStat,
            priority,
            members: [],
          };
          grouped.set(key, group);
        }

        group.members.push({
          tag: fromStat,
        });
      }
    }

    return Array.from(grouped.values());
  }

  private buildGroupKey(toKey: string, priority: string): ClusterKey {
    return `${priority}::${toKey}`;
  }
}
