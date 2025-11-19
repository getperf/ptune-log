import { App, TFolder, Notice } from 'obsidian';
import { FolderNameTagSuggestionStrategy } from '../strategies/FolderNameTagSuggestionStrategy';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { TagVectorSearcher } from 'src/core/services/vector/TagVectorSearcher';
import { logger } from 'src/core/services/logger/loggerInstance';
import { LLMSettings } from 'src/config/LLMSettings';
import { NoteSummaryLoader } from 'src/core/services/notes/NoteSummaryLoader';
import { FolderIndexWriterService } from 'src/core/services/notes/FolderIndexWriterService';
import { TagAliases } from 'src/core/models/tags/TagAliases';

/**
 * 共通タグ生成サービス
 * - 指定フォルダの index.md に対して共通タグを適用
 * - Strategy によりタグ候補を決定
 */
export class CommonTagGenerator {
  private vectorSearcher: TagVectorSearcher;

  constructor(private app: App, private llmClient: LLMClient) {
    this.vectorSearcher = new TagVectorSearcher(app, this.llmClient);
  }

  /**
   * 指定フォルダの index.md に共通タグ候補を適用する
   * - 類似タグ検索（ベクトル検索）が利用可能でなければ中断
   */
  async applyTagsToIndex(folder: TFolder): Promise<string[]> {
    const isAvailable = await this.vectorSearcher.isAvailable();
    if (!isAvailable) {
      new Notice('⚠️ ベクトル検索が利用できません');
      logger.warn('[CommonTagGenerator] vector search unavailable');
      return [];
    }

    const folderPath = folder.path;
    const indexWriter = new FolderIndexWriterService(this.app);
    await indexWriter.ensureIndexNote(folderPath);

    const strategy = new FolderNameTagSuggestionStrategy(
      this.app,
      this.vectorSearcher
    );
    const candidates = await strategy.suggestTags(folder);
    const rawTags = candidates.map((c) => c.name);

    const aliases = new TagAliases();
    await aliases.load(this.app.vault);
    const { normalized, newTags } =
      aliases.normalizeAndRegisterWithDiff(rawTags);

    await indexWriter.updateTags(folderPath, normalized);

    logger.debug(
      `[CommonTagGenerator] normalized tags: ${normalized.join(', ')}`
    );

    return normalized;
  }
}
