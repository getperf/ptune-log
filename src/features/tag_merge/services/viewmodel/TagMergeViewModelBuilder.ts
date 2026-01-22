// src/features/tag_merge/services/TagMergeViewModelBuilder.ts

import { TagMergeCluster } from '../../models/domain/TagMergeCluster';
import {
  TagMergePriorityKey,
  TAG_MERGE_PRIORITIES,
} from '../../models/domain/TagMergePriority';
import { TagMergePriorityGroupVM } from '../../models/viewmodels/TagMergePriorityGroupVM';
import { TagMergeRowVM } from '../../models/viewmodels/TagMergeRowVM';

/**
 * TagMergeViewModelBuilder
 * - TagMergeCluster を UI 描画用 ViewModel に変換する
 * - rows: fromStat.count 降順
 * - groups: toStat.count 降順（priority 内）
 * - low/other は既定チェックOFF
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
      const defaultChecked = this.getDefaultChecked(cluster.priority);

      const rawRows: TagMergeRowVM[] = cluster.members.map((m) => {
        const fromKey = m.tag.key;
        const toKey = cluster.to.key;

        return {
          from: fromKey,
          fromStat: m.tag,
          to: toKey,
          count: m.tag.count,
          checked: defaultChecked,
          visible: displayMode === 'normal' && fromKey !== toKey,
        };
      });

      bucket[cluster.priority].groups.push({
        to: cluster.to.key,
        toStat: cluster.to,
        checked: defaultChecked,
        displayMode,
        rows: this.sortRowsByFromCountDesc(rawRows),
      });
    }

    for (const pg of Object.values(bucket)) {
      pg.groups = this.sortGroupsByToCountDesc(pg.groups);
    }

    return Object.values(bucket).sort(
      (a, b) =>
        (TAG_MERGE_PRIORITIES.get(a.priority)?.order ?? 999) -
        (TAG_MERGE_PRIORITIES.get(b.priority)?.order ?? 999),
    );
  }

  /** low/other は既定チェックOFF */
  private getDefaultChecked(priority: TagMergePriorityKey): boolean {
    return priority !== 'low' && priority !== 'other';
  }

  /** rows: fromStat.count 降順 */
  private sortRowsByFromCountDesc(rows: TagMergeRowVM[]): TagMergeRowVM[] {
    return [...rows].sort((a, b) => b.fromStat.count - a.fromStat.count);
  }

  /** groups: toStat.count 降順 */
  private sortGroupsByToCountDesc(
    groups: TagMergePriorityGroupVM['groups'],
  ): TagMergePriorityGroupVM['groups'] {
    return [...groups].sort((a, b) => b.toStat.count - a.toStat.count);
  }
}
