// File: src/features/tag_merge/application/phases/ApplyMergePhase.ts

import { App } from 'obsidian';
import { TagMergeFlowDialog } from '../../ui/dialogs/TagMergeFlowDialog';
import { ApplyMergeView } from '../../ui/phases/ApplyMergeView';
import { TagMergeContext } from '../TagMergeContext';
import { RenameCandidateExtractor } from '../../services/tag_rename/RenameCandidateExtractor';

export class ApplyMergePhase {
  constructor(
    private readonly app: App,
    private readonly dialog: TagMergeFlowDialog,
    private readonly context: TagMergeContext,
    private readonly onDone: () => void,
  ) {}

  open(): void {
    // --- Review 確定後、Apply 開始時に一度だけ変換 ---
    const extractor = new RenameCandidateExtractor(this.app);

    extractor.extract(this.context.priorityGroups, {
      debug: this.context.debugOptions.showWorkDataDebug,
    });

    const view = new ApplyMergeView(() => {
      // 将来: RenameOperationBuilder / TagRenamer 実行
      this.onDone();
    });

    this.dialog.setPhaseView(view);
  }
}
