// features/tag_merge/services/clustering/TagMergeClusteringService.ts

import { App, normalizePath } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { Tags } from 'src/core/models/tags/Tags';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { KMeansClusteringService } from 'src/core/services/tag_clustering/KMeansClusteringService';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { TagMergeClusteringOptions } from '../../models/TagMergeClusteringOptions';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagMergeCluster } from '../../models/domain/TagMergeCluster';
import { ExclusionTagFilter } from './ExclusionTagFilter';
import { TagMergePriorityResolver } from '../priority/TagMergePriorityResolver';
import { TagMergeClusterBuilder } from './TagMergeClusterBuilder';

export class TagMergeClusteringService {
  async run(
    app: App,
    llmClient: LLMClient,
    options: TagMergeClusteringOptions,
  ): Promise<TagMergeCluster[]> {
    logger.debug('[TagMergeClusteringService] start', options);

    /* --- Tags / Aliases --- */
    const tags = new Tags();
    await tags.load(app.vault);

    const aliases = new TagAliases();
    await aliases.load(app.vault);

    const statResolver = new TagStatResolver(tags, aliases);

    /* --- Vectors --- */
    const vectors = new TagVectors(llmClient);
    await vectors.loadFromVault(app.vault);

    /* --- Clustering --- */
    const clustering = new KMeansClusteringService();
    logger.debug(
      `[TagMergeClusteringService] before cluster: vectors=${vectors.getAll().length}, k=${options.k}`,
    );
    const result = clustering.cluster(vectors.getAll(), {
      k: 300,
      iterations: options.iterations,
    });

    logger.debug(
      `[TagMergeClusteringService] clustered: clusters=${result.clusters.length}, total=${result.meta.total}`,
    );

    /* --- Exclusion --- */
    const exclusionFilter = new ExclusionTagFilter(statResolver, {
      unregisteredOnly: options.exclusion.unregisteredOnly,
      excludeIfClusterSizeAtLeast:
        options.exclusion.excludeIfClusterSizeAtLeast,
    });
    const { filtered } = exclusionFilter.filter(result.clusters);

    /* --- Priority / Build --- */
    const priorityResolver = new TagMergePriorityResolver({
      largeClusterThreshold: options.priority.largeClusterThreshold,
    });
    const clusterBuilder = new TagMergeClusterBuilder(
      statResolver,
      priorityResolver,
    );

    // ★ 修正ポイント
    const { clusters, debugText } = clusterBuilder.build(filtered);

    // await this.saveDebugText(app, debugText);

    logger.debug(
      `[TagMergeClusteringService] done: mergeClusters=${clusters.length}`,
    );

    return clusters;
  }

  private async saveDebugText(app: App, text: string): Promise<void> {
    if (!text) return;

    const configDir = app.vault.configDir;
    const path = normalizePath(
      `${configDir}/plugins/ptune-log/work/tag-merge-clusters.txt`,
    );

    const vault = app.vault;
    logger.info(`[TagMergeClusteringService] saving debug text to ${path}`);

    try {
      await vault.create(path, text);
    } catch (e: any) {
      if (e?.message?.includes('File already exists')) {
        const file = vault.getAbstractFileByPath(path);
        if (file) {
          await vault.modify(file as any, text);
          return;
        }
      }
      throw e;
    }
  }
}
