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
 * - 表示モード（normal / toOnly）は ViewModel に集約
 */
export class TagMergeViewModelBuilder {
  build(clusters: TagMergeCluster[]): TagMergePriorityGroupVM[] {
    const bucket: Record<TagMergePriorityKey, TagMergePriorityGroupVM> = {
      high: { priority: 'high', active: false, groups: [] },
      middle: { priority: 'middle', active: false, groups: [] },
      low: { priority: 'low', active: false, groups: [] },
      other: { priority: 'other', active: false, groups: [] },
    };

    for (const cluster of clusters) {
      const displayMode = cluster.priority === 'other' ? 'toOnly' : 'normal';

      bucket[cluster.priority].groups.push({
        to: cluster.to.key,
        toStat: cluster.to, // UI で件数・未登録表示に使用
        checked: true,
        displayMode,
        rows: cluster.members.map((m) => {
          const fromKey = m.tag.key;
          const toKey = cluster.to.key;

          return {
            from: fromKey,
            fromStat: m.tag, // count / isUnregistered 用
            to: toKey,
            count: m.tag.count,
            checked: true,
            visible: displayMode === 'normal' && fromKey !== toKey,
          };
        }),
      });
    }

    // 表示順は priority 定義に従う（UI 都合）
    return Object.values(bucket).sort(
      (a, b) =>
        (TAG_MERGE_PRIORITIES.get(a.priority)?.order ?? 999) -
        (TAG_MERGE_PRIORITIES.get(b.priority)?.order ?? 999),
    );
  }
}
