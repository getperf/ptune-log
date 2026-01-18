// src/features/tag_merge/services/TagMergeService.ts
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { KMeansClusteringService } from 'src/core/services/tag_clustering/KMeansClusteringService';
import { TagMergeCluster } from '../models/TagMergeCluster';
import { logger } from 'src/core/services/logger/loggerInstance';

export class TagMergeService {
  async cluster(vectors: TagVectors): Promise<TagMergeCluster[]> {
    const service = new KMeansClusteringService();

    const result = service.cluster(vectors.getAll(), {
      k: 300,
      iterations: 5,
    });

    logger.debug(
      `[TagMerge] clustering done: clusters=${result.clusters.length}, total=${result.meta.total}`
    );

    return result.clusters.map((cluster) => ({
      to: cluster.representative.key,
      members: cluster.members.map((m) => ({
        from: m.key,
        count: m.count,
      })),
    }));
  }
}
