// features/tag_merge/services/clustering/TagMergeClusteringService.ts

import { App } from 'obsidian';
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
    const result = clustering.cluster(vectors.getAll(), {
      k: options.k,
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

    const clusters = clusterBuilder.build(filtered);

    logger.debug(
      `[TagMergeClusteringService] done: mergeClusters=${clusters.length}`,
    );

    return clusters;
  }
}
