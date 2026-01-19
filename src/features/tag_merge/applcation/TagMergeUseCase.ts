// src/features/tag_merge/application/TagMergeUseCase.ts
import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { KMeansClusteringService } from 'src/core/services/tag_clustering/KMeansClusteringService';
import { TagMergeViewModelBuilder } from '../services/TagMergeViewModelBuilder';
import { TagMergeResultDialog } from '../ui/TagMergeResultDialog';
import { TagSuggestionService } from 'src/features/tags/services/TagSuggestionService';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagMergeClusterBuilder } from '../services/TagMergeClusterBuilder';
import { TagMergeFlowDialog } from '../ui/TagMergeFlowDialog';

/**
 * TagMergeUseCase
 * - クラスタリング結果を ViewModel に変換し、ダイアログで可視化する
 * - UI 操作・データ更新は行わない
 */
export class TagMergeUseCase {
  private readonly dialog: TagMergeFlowDialog;

  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
  ) {
    const tagSuggestionService = new TagSuggestionService(app, llmClient);

    this.dialog = new TagMergeFlowDialog(
      app,
      () => this.runClustering(),
      () => this.runTagMerge(), // 今は未実装
      tagSuggestionService,
    );
  }

  async execute(): Promise<void> {
    this.dialog.open();
    logger.debug('[TagMergeUseCase] complete');
  }

  /**
   * フェーズ: clustering → reviewMerge
   */
  private async runClustering(): Promise<void> {
    logger.debug('[TagMergeUseCase] phase=clustering');
    this.dialog.setPhase('clustering');

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

    // ViewModel 変換
    const vmBuilder = new TagMergeViewModelBuilder();
    const priorityGroups = vmBuilder.build(mergeClusters);

    // レビュー段階へ
    this.dialog.setReviewResult(priorityGroups);
  }

  /**
   * フェーズ: updateMerge → complete
   * ※ 今回は未実装（フェーズ遷移のみ）
   */
  private async runTagMerge(): Promise<void> {
    logger.debug('[TagMergeUseCase] phase=updateMerge');
    this.dialog.setPhase('updateMerge');

    // TODO: タグマージ実処理は将来実装
    // await this.mergeService.apply(...);

    this.dialog.setComplete();
  }
}
