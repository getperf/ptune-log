// features/tag_merge/services/clustering/TagMergeClusteringService.ts

import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { Tags } from 'src/core/models/tags/Tags';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { KMeansClusteringService } from 'src/core/services/tag_clustering/KMeansClusteringService';
import { TagStatResolver } from 'src/core/services/tags/TagStatResolver';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagMergePriorityGroupVM } from '../../models/viewmodels/TagMergePriorityGroupVM';
import { ExclusionTagFilter } from './ExclusionTagFilter';
import { TagMergePriorityResolver } from '../priority/TagMergePriorityResolver';
import { TagMergeClusterBuilder } from './TagMergeClusterBuilder';
import { TagMergeViewModelBuilder } from '../viewmodel/TagMergeViewModelBuilder';

export class TagMergeClusteringService {
  async run(
    app: App,
    llmClient: LLMClient,
  ): Promise<TagMergePriorityGroupVM[]> {
    logger.debug('[TagMergeClusteringService] start');

    // --- Tags / Aliases
    const tags = new Tags();
    await tags.load(app.vault);

    const aliases = new TagAliases();
    await aliases.load(app.vault);

    const statResolver = new TagStatResolver(tags, aliases);

    // --- Vectors
    const vectors = new TagVectors(llmClient);
    await vectors.loadFromVault(app.vault);

    // --- Clustering
    const clustering = new KMeansClusteringService();
    const result = clustering.cluster(vectors.getAll(), {
      k: 600,
      iterations: 5,
    });

    logger.debug(
      `[TagMergeClusteringService] clustered: clusters=${result.clusters.length}, total=${result.meta.total}`,
    );

    // --- Exclusion
    const exclusionFilter = new ExclusionTagFilter(statResolver, {
      unregisteredOnly: false,
    });
    const { filtered } = exclusionFilter.filter(result.clusters);

    // --- Priority / Cluster build
    const priorityResolver = new TagMergePriorityResolver({
      largeClusterThreshold: 10,
    });
    const clusterBuilder = new TagMergeClusterBuilder(
      statResolver,
      priorityResolver,
    );
    const mergeClusters = clusterBuilder.build(filtered);

    // --- ViewModel
    const vmBuilder = new TagMergeViewModelBuilder();
    const priorityGroups = vmBuilder.build(mergeClusters);

    logger.debug(
      `[TagMergeClusteringService] done: priorityGroups=${priorityGroups.length}`,
    );

    return priorityGroups;
  }
}
