import { Vault, normalizePath } from 'obsidian';
import { Tags } from '../tags/Tags';
import { cosineSimilarity } from 'src/core/utils/vector/vectorUtils';
import { logger } from 'src/core/services/logger/loggerInstance';
import { DateUtil } from 'src/core/utils/date/DateUtil';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';

/** タグ1件分のEmbeddingデータ構造 */
export interface TagVector {
  key: string;
  embedding: number[];
  count: number;
}

/** タグベクトル集合クラス */
export class TagVectors {
  private vectors: TagVector[] = [];

  /** ベクトルDB関連パスの定数定義 */
  private static readonly META_DIR = '_tagging/meta';
  private static readonly VECTOR_DB_FILE = 'tag_vectors.jsonl';
  private static readonly META_INFO_FILE = 'tag_db_info.json';

  /** パス取得メソッド */
  static getVectorDbPath(): string {
    return normalizePath(`${this.META_DIR}/${this.VECTOR_DB_FILE}`);
  }

  static getMetaInfoPath(): string {
    return normalizePath(`${this.META_DIR}/${this.META_INFO_FILE}`);
  }

  constructor(private llmClient: LLMClient) {}

  /** Tags から Embedding を生成して内部に格納 */
  async fromTags(vault: Vault, tags: Tags): Promise<void> {
    const embeddingTags = tags.getEmbeddingTags();
    if (embeddingTags.length === 0) {
      logger.warn('[TagVectors.fromTags] no tags found for embedding');
      return;
    }

    logger.info(
      `[TagVectors.fromTags] generating embeddings for ${embeddingTags.length} tags`
    );

    const tagNames = embeddingTags.map((t) => t.name);
    const embedTexts = await this.llmClient.embedBatch(tagNames);

    this.vectors = embeddingTags.map((row, i) => ({
      key: row.name,
      embedding: embedTexts[i],
      count: row.count,
    }));
  }

  /** ベクトルデータを `_tagging/meta` に保存 */
  async save(vault: Vault): Promise<void> {
    if (this.vectors.length === 0) {
      logger.warn('[TagVectors.save] no vectors to save');
      return;
    }

    const dbPath = TagVectors.getVectorDbPath();
    const infoPath = TagVectors.getMetaInfoPath();

    const lines = this.vectors.map((v) => JSON.stringify(v));
    await vault.adapter.write(dbPath, lines.join('\n'));

    const info = {
      created_at: DateUtil.utcString(),
      total: this.vectors.length,
      model: this.llmClient['settings']?.embeddingModel ?? 'unknown',
    };
    await vault.adapter.write(infoPath, JSON.stringify(info, null, 2));

    logger.info(`[TagVectors.save] saved ${this.vectors.length} vectors`);
  }

  /** ベクトルデータをロード */
  async loadFromVault(vault: Vault): Promise<void> {
    const path = TagVectors.getVectorDbPath();
    const file = vault.getAbstractFileByPath(path);
    if (!file) {
      logger.warn(`[TagVectors.loadFromVault] file not found: ${path}`);
      this.vectors = [];
      return;
    }
    const data = await vault.adapter.read(path);
    this.vectors = data
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as TagVector);
    logger.info(
      `[TagVectors.loadFromVault] loaded ${this.vectors.length} vectors`
    );
  }

  /** クエリベクトルとの類似検索 */
  findSimilar(queryVec: number[], limit = 50) {
    const scored = this.vectors
      .map((v) => ({
        name: v.key,
        count: v.count,
        score: cosineSimilarity(v.embedding, queryVec),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    logger.debug(
      `[TagVectors.findSimilar] done: top=${scored.length}, top1=${
        scored[0]?.name ?? 'none'
      }`
    );
    return scored;
  }

  /** getter群 */
  getAll(): TagVector[] {
    return this.vectors;
  }

  size(): number {
    return this.vectors.length;
  }
}
