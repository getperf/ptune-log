// src/features/tag_merge/services/TagMergeClusterBuilder.ts

import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagMergeCluster } from '../models/TagMergeCluster';
import { TagMergePriorityKey } from '../models/TagMergePriority';

/**
 * TagMergeClusterBuilder
 * - KMeans の TagCluster を TagMergeCluster に変換
 * - 優先度（priority）の判定責務を持つ
 */
export class TagMergeClusterBuilder {
  build(clusters: TagCluster[]): TagMergeCluster[] {
    return clusters.map((cluster) => ({
      to: cluster.representative.key,
      priority: this.detectPriority(cluster),
      members: cluster.members.map((m) => ({
        from: m.key,
        count: m.count,
      })),
    }));
  }

  /**
   * 優先度判定
   * - hierarchy: to/xxx 形式
   * - variant: 表記ゆれ
   * - similar: それ以外（ベクトル類似）
   */
  private detectPriority(cluster: TagCluster): TagMergePriorityKey {
    const to = cluster.representative.key;
    const froms = cluster.members.map((m) => m.key);

    if (froms.some((f) => f.startsWith(`${to}/`))) {
      return 'hierarchy';
    }

    if (froms.some((f) => this.isVariant(f, to))) {
      return 'variant';
    }

    return 'similar';
  }

  private isVariant(a: string, b: string): boolean {
    const normalize = (s: string) => s.replace(/[-_/]/g, '').toLowerCase();
    return normalize(a) === normalize(b);
  }
}
