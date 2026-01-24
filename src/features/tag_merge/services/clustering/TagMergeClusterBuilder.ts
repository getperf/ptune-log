// src/features/tag_merge/services/TagMergeClusterBuilder.ts

import { TagCluster } from 'src/core/services/tag_clustering/models/TagCluster';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { TagMergeCluster } from '../../models/domain/TagMergeCluster';
import { TagMergePriorityResolver } from '../priority/TagMergePriorityResolver';
import { logger } from 'src/core/services/logger/loggerInstance';

type ClusterKey = string;

/**
 * デバッグ用表示モデル
 * to -> [{ from, priority }]
 */
type DebugClusterMap = Map<string, Array<{ from: string; priority: string }>>;

export class TagMergeClusterBuilder {
  constructor(
    private readonly statResolver: TagStatResolver,
    private readonly priorityResolver: TagMergePriorityResolver,
  ) {}

  build(clusters: TagCluster[]): TagMergeCluster[] {
    const grouped = new Map<ClusterKey, TagMergeCluster>();
    const debugMap: DebugClusterMap = new Map();

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

        // ---- 本来のクラスタ生成処理 ----
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

        group.members.push({ tag: fromStat });

        // ---- デバッグ用集計 ----
        const list = debugMap.get(toKey) ?? [];
        list.push({ from: fromKey, priority });
        debugMap.set(toKey, list);
      }
    }

    // ---- デバッグ出力（まとめて）----
    this.logDebugClusters(debugMap);

    return Array.from(grouped.values());
  }

  private buildGroupKey(toKey: string, priority: string): ClusterKey {
    return `${priority}::${toKey}`;
  }

  /**
   * toタグ単位で from(優先度) を一覧表示
   *
   * 出力例:
   * 用途/開発 : 用途/実装(高), 用途/設計(中)
   */
  private logDebugClusters(map: DebugClusterMap): void {
    logger.debug('[ClusterBuilder] ===== cluster summary =====');
    const lines = [];
    for (const [to, members] of map.entries()) {
      const summary = members
        .filter((m) => m.from !== to)
        .map((m) => `${m.from}(${m.priority})`)
        .join(', ');
      if (members.length > 1) {
        lines.push(`${to} : ${summary}`);
      }
    }
    logger.debug(`[ClusterBuilder] ${lines.join('\n')}`);
  }
}
