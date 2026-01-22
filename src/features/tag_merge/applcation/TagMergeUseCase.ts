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

import { Tags } from 'src/core/models/tags/Tags';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { ExclusionTagFilter } from '../services/ExclusionTagFilter';
import { TagMergePriorityResolver } from '../services/TagMergePriorityResolver';
import { TagExtractor } from 'src/features/tags/services/TagExtractor';

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
  async open(): Promise<void> {
    await this.showPreparePhase();
    this.dialog.open();
  }

  /* =========================
   * Phase 1: クラスタリング準備／実行
   * ========================= */
  private async showPreparePhase(): Promise<void> {
    const messages = await this.detectTagDiffMessages();

    const view = new PrepareClusteringView(
      async () => {
        await this.runClustering();
      },
      () => this.dialog.close(),
      messages,
    );

    this.dialog.setPhaseView(view);
  }

  private async runClustering(): Promise<void> {
    try {
      logger.debug('[TagMergeUseCase] clustering start');

      /* --- タグ統計ロード（件数・未登録判定用） --- */
      const tags = new Tags();
      await tags.load(this.app.vault);

      const aliases = new TagAliases();
      await aliases.load(this.app.vault);

      const statResolver = new TagStatResolver(tags, aliases);

      /* --- ベクトルロード --- */
      const vectors = new TagVectors(this.llmClient);
      await vectors.loadFromVault(this.app.vault);

      /* --- クラスタリング --- */
      const clustering = new KMeansClusteringService();
      const result = clustering.cluster(vectors.getAll(), {
        k: 600,
        iterations: 5,
      });

      logger.debug(
        `[TagMergeUseCase] clustering done: clusters=${result.clusters.length}, total=${result.meta.total}`,
      );

      /* --- 除外フィルタ（未登録のみ / 大規模クラスタ除外） --- */
      const exclusionFilter = new ExclusionTagFilter(statResolver, {
        unregisteredOnly: false, // 設定化するなら settings 参照
        // excludeIfClusterSizeAtLeast: 10,  // n 件以上は除外
      });
      const { filtered, excluded } = exclusionFilter.filter(result.clusters);
      logger.debug(
        `[TagMergeUseCase] exclusion applied: filteredClusters=${filtered.length}, excludedItems=${excluded.length}`,
      );

      /* --- クラスタ → マージ候補（TagStat 付き） --- */
      const priorityResolver = new TagMergePriorityResolver({
        largeClusterThreshold: 10,
      });
      const clusterBuilder = new TagMergeClusterBuilder(
        statResolver,
        priorityResolver,
      );
      const mergeClusters = clusterBuilder.build(filtered);

      /* --- ViewModel 生成 --- */
      const vmBuilder = new TagMergeViewModelBuilder();
      const priorityGroups = vmBuilder.build(mergeClusters);

      this.showReviewPhase(priorityGroups);
    } catch (e) {
      logger.error('[TagMergeUseCase] clustering failed', e);
      // 簡易対応：準備フェーズに戻す
      this.showPreparePhase();
    }
  }

  private async detectTagDiffMessages(): Promise<string[]> {
    const messages: string[] = [];

    // --- マスター（ノート由来タグ）
    const sourceMap = await TagExtractor.extractAllAsMap(this.app, {
      excludeUnclassified: true,
    });
    const sourceKeys = new Set(sourceMap.keys());

    // --- Tags DB
    const tags = new Tags();
    await tags.load(this.app.vault);
    const tagDbMap = tags.getRawEntryMap();
    const tagDbKeys = new Set(tagDbMap.keys());

    const tagAdd = [...sourceKeys].filter((k) => !tagDbKeys.has(k)).length;
    const tagDel = [...tagDbKeys].filter((k) => !sourceKeys.has(k)).length;

    const tmp = [...tagDbKeys].filter((k) => !sourceKeys.has(k));
    logger.debug(`[TagMerge] del: ${tmp}`);

    if (tagAdd > 0 || tagDel > 0) {
      messages.push(`タグDB: 追加 ${tagAdd} / 削除 ${tagDel}`);
    } else {
      messages.push('タグDB: 差分なし');
    }

    // --- TagVectors
    const vectors = new TagVectors(this.llmClient);
    await vectors.loadFromVault(this.app.vault);
    const vectorMap = vectors.getRawEntryMap();
    const vectorKeys = new Set(vectorMap.keys());

    const vecAdd = [...sourceKeys].filter((k) => !vectorKeys.has(k)).length;
    const vecDel = [...vectorKeys].filter((k) => !sourceKeys.has(k)).length;

    if (vecAdd > 0 || vecDel > 0) {
      messages.push(`ベクトルDB: 追加 ${vecAdd} / 削除 ${vecDel}`);
      messages.push('※ ベクトル更新は時間・コストがかかります');
    } else {
      messages.push('ベクトルDB: 差分なし');
    }

    return messages;
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
