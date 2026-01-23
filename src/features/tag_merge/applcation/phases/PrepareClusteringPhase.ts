// src/features/tag_merge/application/phases/PrepareClusteringPhase.ts

import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { TagMergeFlowDialog } from '../../ui/TagMergeFlowDialog';
import { PrepareClusteringView } from '../../ui/phases/PrepareClusteringView';
import { TagMergeContext } from '../TagMergeContext';
import { TagMergeDiffService } from '../../services/diff/TagMergeDiffService';
import { TagMergeClusteringService } from '../../services/clustering/TagMergeClusteringService';
import { TagMergeClusteringOptions } from '../../models/TagMergeClusteringOptions';
import { TagMergeViewModelBuilder } from '../../services/viewmodel/TagMergeViewModelBuilder';
import { TagDBMaintainer } from 'src/features/tags/services/TagDBMaintainer';

export class PrepareClusteringPhase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
    private readonly dialog: TagMergeFlowDialog,
    private readonly context: TagMergeContext,
    private readonly onNext: () => void,
    private readonly onCancel: () => void,
  ) {}

  async open(): Promise<void> {
    // --- 差分検知
    const diffService = new TagMergeDiffService(this.app, this.llmClient);
    const diffSummary = await diffService.detect();
    const messages = diffService.buildMessages(diffSummary);

    const hasDiff =
      diffSummary.tagDB.added.length > 0 ||
      diffSummary.tagDB.removed.length > 0 ||
      diffSummary.vectorDB.added.length > 0 ||
      diffSummary.vectorDB.removed.length > 0;

    // --- View 作成
    const view = new PrepareClusteringView(
      async (options: TagMergeClusteringOptions, rebuildDb: boolean) => {
        // Context 反映
        this.context.clusteringOptions = options;

        // --- DB 更新（任意）
        if (rebuildDb) {
          view.updateStatus('DB 更新中...');
          const maintainer = new TagDBMaintainer(this.app, this.llmClient);
          await maintainer.rebuildAll(); // 暫定：常に全再構築
        }

        // --- クラスタリング
        view.updateStatus('クラスタリング中...');
        const clusteringService = new TagMergeClusteringService();
        const vmBuilder = new TagMergeViewModelBuilder();

        const clusters = await clusteringService.run(
          this.app,
          this.llmClient,
          options,
        );

        this.context.priorityGroups = vmBuilder.build(clusters);

        view.updateStatus('完了');
        this.onNext();
      },
      this.onCancel,
      messages,
      this.context.clusteringOptions,
      hasDiff, // ★ 差分ありなら DB 更新トグル既定 ON
    );

    view.updateStatus('準備中...');
    this.dialog.setPhaseView(view);
  }
}
