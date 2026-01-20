// src/features/tag_merge/services/TagMergeViewModelBuilder.ts

import { TagMergeCluster } from '../models/TagMergeCluster';
import {
  TagMergePriorityKey,
  TAG_MERGE_PRIORITIES,
} from '../models/TagMergePriority';
import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';

/**
 * TagMergeViewModelBuilder
 * - TagMergeCluster を UI 描画用 ViewModel に変換する
 * - 優先度の判定ロジックは持たない
 */
export class TagMergeViewModelBuilder {
  build(clusters: TagMergeCluster[]): TagMergePriorityGroupVM[] {
    const bucket: Record<TagMergePriorityKey, TagMergePriorityGroupVM> = {
      hierarchy: { priority: 'hierarchy', active: false, groups: [] },
      variant: { priority: 'variant', active: false, groups: [] },
      similar: { priority: 'similar', active: false, groups: [] },
      other: { priority: 'other', active: false, groups: [] },
    };

    for (const cluster of clusters) {
      bucket[cluster.priority].groups.push({
        to: cluster.to.key,
        toStat: cluster.to, // UI で件数・未登録表示に使用
        checked: true,
        items: cluster.members.map((m) => ({
          from: m.tag.key,
          fromStat: m.tag, // UI 側で count / isUnregistered を参照可能
          to: cluster.to.key,
          count: m.tag.count,
          checked: true,
        })),
      });
    }

    // 表示順は priority 定義に従う（UI都合）
    return Object.values(bucket).sort(
      (a, b) =>
        (TAG_MERGE_PRIORITIES.get(a.priority)?.order ?? 999) -
        (TAG_MERGE_PRIORITIES.get(b.priority)?.order ?? 999),
    );
  }
}
