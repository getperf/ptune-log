/**
 * CommonTagAnalyzer
 * - プロジェクトフォルダの共通タグ生成を行い、index.md に反映する。
 * - enableCommonTag / forceCommonTags を NoteAnalysisService と統一。
 */
import { App } from 'obsidian';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { IAnalyzer } from './IAnalyzer';
import { CommonTagGenerator } from 'src/features/note_creator/services/CommonTagGenerator';

/** CommonTagAnalyzer のオプション（名称統一） */
export interface CommonTagAnalyzerOptions {
  enableCommonTag?: boolean; // 実行の有無
  forceCommonTags?: boolean; // index.md に既存があっても再生成する
}

export class CommonTagAnalyzer implements IAnalyzer<CommonTagAnalyzerOptions> {
  private generator: CommonTagGenerator | null = null;

  constructor(private readonly app: App, private readonly client: LLMClient) {}

  private getGenerator(): CommonTagGenerator {
    if (!this.generator) {
      this.generator = new CommonTagGenerator(this.app, this.client);
    }
    return this.generator;
  }

  async analyze(
    summaries: NoteSummaries,
    options?: CommonTagAnalyzerOptions
  ): Promise<void> {
    const enabled = options?.enableCommonTag ?? true;
    const force = options?.forceCommonTags ?? false;

    logger.debug(
      `[CommonTagAnalyzer] start enabled=${enabled}, force=${force}`
    );

    if (!enabled) {
      logger.debug(`[CommonTagAnalyzer] skipped (enableCommonTag = false)`);
      return;
    }

    for (const folder of summaries.getFoldersSorted()) {
      const existing = (await folder.getCommonTags(this.app)) ?? [];

      if (!force && existing.length > 0) {
        logger.debug(
          `[CommonTagAnalyzer] skip folder=${folder.noteFolder} (existing common tags)`
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
