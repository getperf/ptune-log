// features/tag_merge/application/TagMergeUseCase.ts

import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';

import { TagMergeFlowDialog } from '../ui/TagMergeFlowDialog';
import { PrepareClusteringView } from '../ui/phases/PrepareClusteringView';
import { ReviewMergeView } from '../ui/phases/ReviewMergeView';
import { ApplyMergeView } from '../ui/phases/ApplyMergeView';

import { TagMergeDiffService } from '../services/diff/TagMergeDiffService';
import { TagMergeClusteringService } from '../services/clustering/TagMergeClusteringService';
import { TagMergePriorityGroupVM } from '../models/viewmodels/TagMergePriorityGroupVM';

export class TagMergeUseCase {
  private readonly dialog: TagMergeFlowDialog;
  private readonly tagSuggestionService: TagSuggestionService;

  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
  ) {
    this.dialog = new TagMergeFlowDialog(app);
    this.tagSuggestionService = new TagSuggestionService(app, llmClient);
  }

  async open(): Promise<void> {
    const diffService = new TagMergeDiffService(this.app, this.llmClient);
    const clusteringService = new TagMergeClusteringService();

    const messages = await diffService.detectMessages();

    const prepareView = new PrepareClusteringView(
      async () => {
        const priorityGroups: TagMergePriorityGroupVM[] =
          await clusteringService.run(this.app, this.llmClient);

        this.showReviewPhase(priorityGroups);
      },
      () => this.dialog.close(),
      messages,
    );

    this.dialog.setPhaseView(prepareView);
    this.dialog.open();
  }

  private showReviewPhase(priorityGroups: TagMergePriorityGroupVM[]): void {
    const view = new ReviewMergeView(
      this.app,
      priorityGroups,
      this.tagSuggestionService,
      () => this.showApplyPhase(),
      () => this.dialog.close(),
    );

    this.dialog.setPhaseView(view);
  }

  private showApplyPhase(): void {
    const view = new ApplyMergeView(() => {
      this.dialog.close();
    });

    this.dialog.setPhaseView(view);
  }
}
