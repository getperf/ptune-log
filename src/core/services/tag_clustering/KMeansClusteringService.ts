import { TagVector } from 'src/core/models/vectors/TagVectors';
import { cosineSimilarity } from 'src/core/utils/vector/vectorUtils';
import { SimpleKMeans } from './SimpleKMeans';
import { TagCluster } from './models/TagCluster';
import { TagClusterResult } from './models/TagClusterResult';

export interface KMeansClusterOptions {
  k: number;
  iterations?: number;
}

export class KMeansClusteringService {
  cluster(tags: TagVector[], options: KMeansClusterOptions): TagClusterResult {
    const { k, iterations = 5 } = options;

    const vectors = tags.map((t) => t.embedding);
    const assignments = SimpleKMeans.run(vectors, {
      k,
      iterations,
    });

    const clusters: TagCluster[] = [];

    for (let c = 0; c < k; c++) {
      const members = tags.filter((_, i) => assignments[i] === c);
      if (members.length === 0) continue;

      const centroid = this.computeCentroid(members.map((m) => m.embedding));

      const representative = this.pickRepresentative(members, centroid);

      clusters.push({ representative, members });
    }

    return {
      clusters,
      meta: {
        k,
        total: tags.length,
      },
    };
  }

  private computeCentroid(vectors: number[][]): number[] {
    const dim = vectors[0].length;
    const mean = new Array<number>(dim).fill(0);

    for (const v of vectors) {
      for (let d = 0; d < dim; d++) {
        mean[d] += v[d];
      }
    }
    for (let d = 0; d < dim; d++) {
      mean[d] /= vectors.length;
    }
    return mean;
  }

  private pickRepresentative(
    members: TagVector[],
    centroid: number[]
  ): TagVector {
    return members.reduce((best, cur) => {
      const s1 = cosineSimilarity(best.embedding, centroid);
      const s2 = cosineSimilarity(cur.embedding, centroid);
      return s2 > s1 ? cur : best;
    });
  }
}
