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

/**
 * TagMergeUseCase
 * - クラスタリング結果を ViewModel に変換し、ダイアログで可視化する
 * - UI 操作・データ更新は行わない
 */
export class TagMergeUseCase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) {}

  async execute(): Promise<void> {
    logger.debug('[TagMergeUseCase] start');

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
      `[TagMergeUseCase] clustering done: clusters=${result.clusters.length}, total=${result.meta.total}`
    );

    // KMeans → TagMergeCluster（優先度確定）
    const clusterBuilder = new TagMergeClusterBuilder();
    const mergeClusters = clusterBuilder.build(result.clusters);

    // TagMergeCluster → ViewModel（UI用）
    const vmBuilder = new TagMergeViewModelBuilder();
    const priorityGroups = vmBuilder.build(mergeClusters);

    // タグ候補検索（Dialog 用）
    const tagSuggestionService = new TagSuggestionService(
      this.app,
      this.llmClient
    );

    // 描画（表示専用）
    new TagMergeResultDialog(
      this.app,
      priorityGroups,
      tagSuggestionService
    ).open();

    logger.debug('[TagMergeUseCase] complete');
  }
}
