import { App } from 'obsidian';
import { TagYamlIO } from 'src/core/services/yaml/TagYamlIO';
import { Tags } from 'src/core/models/tags/Tags';
import { TagCandidate } from 'src/core/models/tags/TagCandidate';
import { TagVectorSearcher } from 'src/core/services/vector/TagVectorSearcher';
import { logger } from 'src/core/services/logger/loggerInstance';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';

/**
 * TagSuggestionService
 * -----------------------------------------
 * タグ候補検索サービス。
 * - mode = normal → Tagsモデルによるテキスト検索
 * - mode = vector → LLM + embeddings によるベクトル検索
 * - TagVectorSearcher と連携して検索方式を切り替える
 */
export class TagSuggestionService {
  private tags = new Tags();
  private loaded = false;
  private vectorSearcher: TagVectorSearcher;

  constructor(private app: App, private llmClient: LLMClient) {
    this.vectorSearcher = new TagVectorSearcher(app, llmClient);
  }

  /**
   * Tags（通常辞書）の初回読み込みを保証する
   */
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;

    const io = new TagYamlIO();
    await io.ensure(this.app);
    await this.tags.load(this.app.vault);
    this.loaded = true;

    logger.debug(
      `[TagSuggestionService.ensureLoaded] tags loaded: total=${
        this.tags.getAll().length
      }`
    );
  }

  /**
   * LLMClient がベクトル検索可能かどうか
   */
  isVectorSearchAvailable(): boolean {
    const available = !!this.llmClient?.isVectorSearchAvailable();
    logger.debug(`[TagSuggestionService] vectorSearchAvailable=${available}`);
    return available;
  }

  /**
   * タグ候補検索（通常／ベクトル の両モード対応）
   * @param keyword キーワード
   * @param options.mode "normal" | "vector"
   * @param options.limit 最大件数
   */
  async searchCandidates(
    keyword: string,
    options?: { mode?: 'normal' | 'vector'; limit?: number }
  ): Promise<TagCandidate[]> {
    await this.ensureLoaded();

    const mode = options?.mode ?? 'normal';
    const limit = options?.limit ?? 50;

    logger.debug(
      `[TagSuggestionService.searchCandidates] mode=${mode} keyword="${keyword}" limit=${limit}`
    );

    if (mode === 'vector') {
      return await this.vectorSearcher.search(keyword, { limit });
    } else {
      return this.searchTextCandidates(keyword, limit);
    }
  }

  /**
   * 通常検索：Tagsモデルの検索
   */
  private searchTextCandidates(keyword: string, limit: number): TagCandidate[] {
    const key = keyword.split('/').pop()?.toLowerCase() ?? '';
    const matched = this.tags.searchByKeyword(keyword, limit);

    logger.debug(
      `[TagSuggestionService.searchTextCandidates] key=${key} found=${matched.length}`
    );

    return matched.map((t) => ({
      name: t.name,
      count: t.count,
      tagKind: t.tagKind,
    }));
  }
}
