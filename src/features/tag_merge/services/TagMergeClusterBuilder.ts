// src/features/tag_merge/services/TagMergeClusterBuilder.ts
import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagMergeCluster } from '../models/TagMergeCluster';

/**
 * KMeans の TagCluster を TagMerge 用モデルに変換する
 */
export class TagMergeClusterBuilder {
  build(clusters: TagCluster[]): TagMergeCluster[] {
    return clusters.map((cluster) => ({
      to: cluster.representative.key,
      members: cluster.members.map((m) => ({
        from: m.key,
        count: m.count,
      })),
    }));
  }
}
