// features/tag_merge/application/phases/ApplyMergePhase.ts

import { TagMergeFlowDialog } from '../../ui/TagMergeFlowDialog';
import { ApplyMergeView } from '../../ui/phases/ApplyMergeView';
import { TagMergeContext } from '../TagMergeContext';
// import { buildEditedResult } from '../../services/apply/TagMergeApplyInputBuilder';

export class ApplyMergePhase {
  constructor(
    private readonly dialog: TagMergeFlowDialog,
    private readonly context: TagMergeContext,
    private readonly onDone: () => void,
  ) {}

  open(): void {
    // Review 確定時に一度だけ変換（実装は将来）
    // const editedResult = buildEditedResult(this.context.priorityGroups);

    const view = new ApplyMergeView(() => {
      // バッチ処理実行（将来）
      this.onDone();
    });

    this.dialog.setPhaseView(view);
  }
}
