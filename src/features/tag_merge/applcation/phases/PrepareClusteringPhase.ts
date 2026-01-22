// features/tag_merge/application/phases/PrepareClusteringPhase.ts

import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { TagMergeFlowDialog } from '../../ui/TagMergeFlowDialog';
import { PrepareClusteringView } from '../../ui/phases/PrepareClusteringView';
import { TagMergeContext } from '../TagMergeContext';
import { TagMergeDiffService } from '../../services/diff/TagMergeDiffService';
import { TagMergeClusteringService } from '../../services/clustering/TagMergeClusteringService';
import { TagMergeClusteringOptions } from '../../models/TagMergeClusteringOptions';
import { TagMergeViewModelBuilder } from '../../services/viewmodel/TagMergeViewModelBuilder';

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
    const diffService = new TagMergeDiffService(this.app, this.llmClient);
    const messages = await diffService.detectMessages();

    const view = new PrepareClusteringView(
      async (options: TagMergeClusteringOptions) => {
        // 確定値は Phase で Context に反映
        this.context.clusteringOptions = options;

        const clusteringService = new TagMergeClusteringService();
        const vmBuilder = new TagMergeViewModelBuilder();

        const clusters = await clusteringService.run(
          this.app,
          this.llmClient,
          options,
        );

        this.context.priorityGroups = vmBuilder.build(clusters);
        this.onNext();
      },
      this.onCancel,
      messages,
      this.context.clusteringOptions,
    );

    this.dialog.setPhaseView(view);
  }
}
