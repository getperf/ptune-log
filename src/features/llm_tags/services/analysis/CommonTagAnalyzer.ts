/**
 * CommonTagAnalyzer
 * - プロジェクトフォルダの共通タグ生成を行い、index.md に反映する。
 * - FolderIndexWriter / CommonTagGenerator を利用。
 */
import { App } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { IAnalyzer } from './IAnalyzer';
import { CommonTagGenerator } from 'src/features/note_creator/services/CommonTagGenerator';

export class CommonTagAnalyzer implements IAnalyzer {
  /** 遅延生成する内部 generator */
  private generator: CommonTagGenerator | null = null;

  constructor(private readonly app: App, private readonly client: LLMClient) {}

  /** CommonTagGenerator の遅延生成 */
  private getGenerator(): CommonTagGenerator {
    if (!this.generator) {
      this.generator = new CommonTagGenerator(this.app, this.client);
    }
    return this.generator;
  }

  /**
   * analyze
   * - 各フォルダの共通タグを生成／更新する。
   * - タグが既に index.md に存在する場合はスキップ。
   */
  async analyze(
    summaries: NoteSummaries,
    options?: { force?: boolean }
  ): Promise<void> {
    const force = options?.force ?? false;

    logger.debug(`[CommonTagAnalyzer] start force=${force}`);

    for (const folder of summaries.getFoldersSorted()) {
      const existing = (await folder.getCommonTags(this.app)) ?? [];

      // 既に index.md に共通タグがあればスキップ
      if (!force && existing.length > 0) {
        logger.debug(
          `[CommonTagAnalyzer] skip folder=${folder.noteFolder} (common tags exist)`
        );
        continue;
      }

      logger.debug(
        `[CommonTagAnalyzer] processing folder=${folder.noteFolder}`
      );

      const projectFolder = folder.getTFolder(this.app);
      if (!projectFolder) {
        logger.warn(
          `[CommonTagAnalyzer] folder not found: ${folder.noteFolder}`
        );
        continue;
      }

      const tags = await this.getGenerator().applyTagsToIndex(projectFolder);

      folder.setCommonTags?.(tags);

      logger.debug(
        `[CommonTagAnalyzer] applied tags folder=${
          folder.noteFolder
        } tags=${tags.join(', ')}`
      );
    }

    logger.debug('[CommonTagAnalyzer] complete');
  }
}
