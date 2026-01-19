// src/features/tag_merge/application/TagMergeUseCase.ts

import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { KMeansClusteringService } from 'src/core/services/tag_clustering/KMeansClusteringService';
import { TagMergeClusterBuilder } from '../services/TagMergeClusterBuilder';
import { TagMergeViewModelBuilder } from '../services/TagMergeViewModelBuilder';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { logger } from 'src/core/services/logger/loggerInstance';

import { TagMergeFlowDialog } from '../ui/TagMergeFlowDialog';
import { PrepareClusteringView } from '../ui/phases/PrepareClusteringView';
import { ReviewMergeView } from '../ui/phases/ReviewMergeView';
import { ApplyMergeView } from '../ui/phases/ApplyMergeView';
import { TagMergePriorityGroupVM } from '../models/TagMergePriorityGroupVM';

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

  /**
   * エントリポイント
   */
  open(): void {
    this.showPreparePhase();
    this.dialog.open();
  }

  /* =========================
   * Phase 1: クラスタリング準備／実行
   * ========================= */
  private showPreparePhase(): void {
    const view = new PrepareClusteringView(
      async () => {
        await this.runClustering();
      },
      () => this.dialog.close(),
    );

    this.dialog.setPhaseView(view);
  }

  private async runClustering(): Promise<void> {
    try {
      logger.debug('[TagMergeUseCase] clustering start');

      // ベクトルロード
      const vectors = new TagVectors(this.llmClient);
      await vectors.loadFromVault(this.app.vault);

      // クラスタリング
      const clustering = new KMeansClusteringService();
      const result = clustering.cluster(vectors.getAll(), {
        k: 300,
        iterations: 5,
      });

      logger.debug(
        `[TagMergeUseCase] clustering done: clusters=${result.clusters.length}, total=${result.meta.total}`,
      );

      // クラスタ → マージ候補
      const clusterBuilder = new TagMergeClusterBuilder();
      const mergeClusters = clusterBuilder.build(result.clusters);

      // ViewModel 生成
      const vmBuilder = new TagMergeViewModelBuilder();
      const priorityGroups = vmBuilder.build(mergeClusters);

      this.showReviewPhase(priorityGroups);
    } catch (e) {
      logger.error('[TagMergeUseCase] clustering failed', e);
      // 今回は簡易対応：準備フェーズに戻す
      this.showPreparePhase();
    }
  }

  /* =========================
   * Phase 2: レビュー
   * ========================= */
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

  /* =========================
   * Phase 3: タグマージ実行（スケルトン）
   * ========================= */
  private showApplyPhase(): void {
    const view = new ApplyMergeView(() => {
      // 処理は未実装。完了ボタンで閉じるのみ
      this.dialog.close();
    });

    this.dialog.setPhaseView(view);
  }
}
