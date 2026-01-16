import { cosineSimilarity } from 'src/core/utils/vector/vectorUtils';

export interface SimpleKMeansOptions {
  k: number;
  iterations: number;
}

/**
 * 簡易 KMeans
 * - 反復回数固定
 * - cosine 類似度
 * - 収束判定なし
 */
export class SimpleKMeans {
  static run(vectors: number[][], options: SimpleKMeansOptions): number[] {
    const { k, iterations } = options;
    const n = vectors.length;

    // --- 初期中心（先頭 k 件を使用：再現性重視） ---
    let centroids = vectors.slice(0, k).map((v) => [...v]);

    let assignments = new Array<number>(n).fill(0);

    for (let iter = 0; iter < iterations; iter++) {
      // --- 割当 ---
      for (let i = 0; i < n; i++) {
        let best = 0;
        let bestScore = -Infinity;

        for (let c = 0; c < k; c++) {
          const score = cosineSimilarity(vectors[i], centroids[c]);
          if (score > bestScore) {
            bestScore = score;
            best = c;
          }
        }
        assignments[i] = best;
      }

      // --- 中心更新 ---
      const sums = Array.from({ length: k }, () => [] as number[][]);

      for (let i = 0; i < n; i++) {
        sums[assignments[i]].push(vectors[i]);
      }

      centroids = sums.map((cluster, idx) => {
        if (cluster.length === 0) {
          return centroids[idx]; // 空クラスタは維持
        }

        const dim = cluster[0].length;
        const mean = new Array<number>(dim).fill(0);

        for (const v of cluster) {
          for (let d = 0; d < dim; d++) {
            mean[d] += v[d];
          }
        }

        for (let d = 0; d < dim; d++) {
          mean[d] /= cluster.length;
        }
        return mean;
      });
    }

    return assignments;
  }
}
