import { App, Notice, TFile, TFolder } from 'obsidian';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteSummaries } from 'src/core/models/notes/NoteSummaries';
import { LLMTagFileProcessor } from './LLMTagFileProcessor';
import { NoteSearchService } from 'src/core/services/notes/NoteSearchService';
import { IProgressReporter } from './IProgressReporter';
import { TagYamlIO } from 'src/core/services/yaml/TagYamlIO';
import { UnregisteredTagService } from 'src/core/services/tags/UnregisteredTagService';
import { NoteSummaryFactory } from 'src/core/models/notes/NoteSummaryFactory';
import { TagRankService } from 'src/features/tags/services/TagRankService';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { LLMPromptService } from 'src/core/services/llm/client/LLMPromptService';

/**
 * --- LLMTagGenerationRunner
 * LLM による複数ノート解析の統括クラス。
 * 既存メソッド構成を維持したまま、内部処理を NoteSummaryFactory ベースに調整。
 */
export class LLMTagGenerationRunner {
  private noteSearch: NoteSearchService;

  constructor(
    private readonly app: App,
    private readonly client?: LLMClient,
    private readonly promptService?: LLMPromptService
  ) {
    this.noteSearch = new NoteSearchService(app);
  }

  /** 指定日付のノート取得 */
  async findFilesByDate(date: Date): Promise<TFile[]> {
    return await this.noteSearch.findByDate(date);
  }

  /** 指定フォルダ配下のノート取得 */
  findFilesInFolder(folder: TFolder): TFile[] {
    return this.noteSearch.findInFolder(folder);
  }

  /**
   * runOnFiles
   * - LLM によるタグ生成のメイン処理
   * - UI 依存部分（進行表示）は IProgressReporter に委譲
   */
  async runOnFiles(
    files: TFile[],
    reporter?: IProgressReporter,
    force = false
  ): Promise<NoteSummaries> {
    logger.debug(
      `[LLMTagGenerationRunner.runOnFiles] start total=${files.length} force=${force}`
    );

    if (!this.promptService || !this.client) {
      throw new Error('LLMTagGenerationRunner: Missing dependencies.');
    }

    if (files.length === 0) {
      logger.warn('[LLMTagGenerationRunner] no files found');
      new Notice('対象ノートが見つかりません。');
      return new NoteSummaries();
    }

    // --- Reporter に開始通知
    reporter?.onStart(files.length);

    // --- タグエイリアス
    const aliases = new TagAliases();
    await aliases.load(this.app.vault);
    logger.debug('[LLMTagGenerationRunner] TagAliases loaded');

    // --- プロンプト生成
    const topTags = await new TagRankService(this.app).getFormattedTopTags();
    const prompt = await this.promptService.loadAndApply(
      '_templates/llm/system/tag_generate_system.md',
      '_templates/llm/tag_generate.md',
      { TOP_TAGS: topTags }
    );
    logger.debug('[LLMTagGenerationRunner] prompt ready');

    const processor = new LLMTagFileProcessor(this.app, this.client);
    const summaries = new NoteSummaries();
    let errorCount = 0;

    // --- ファイル逐次処理
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // UI側へ進捗を通知
      reporter?.onProgress(i, file);

      try {
        logger.debug(
          `[LLMTagGenerationRunner] processing file=${file.path} index=${i}`
        );

        const summary = await processor.process(file, prompt, aliases, force);
        summaries.add(summary);

        logger.debug(
          `[LLMTagGenerationRunner] processed: ${file.path} (index ${i})`
        );
      } catch (e) {
        logger.error(`[LLMTagGenerationRunner] error in ${file.path}`, e);
        errorCount++;
      }
    }

    // 未登録タグを一括セット
    const tagYamlIO = new TagYamlIO();
    const unregisteredService = new UnregisteredTagService(tagYamlIO);
    const updatedSummaries = await summaries.applyUnregisteredTags(
      this.app,
      unregisteredService
    );

    // --- 集計結果
    const totalUnregistered = updatedSummaries.getAllUnregisteredTags().length;
    logger.debug(
      `[UnregisteredTag] completed totalUnregistered=${totalUnregistered}`
    );

    // --- ファイル処理完了通知
    reporter?.onFinish(files.length - errorCount, errorCount);

    logger.info(
      `[LLMTagGenerationRunner] complete. total=${files.length}, errors=${errorCount}`
    );
    if (errorCount > 0) {
      new Notice(
        `⚠️ ${errorCount}件のエラー発生。詳細はログを確認してください。`
      );
    }

    return updatedSummaries;
  }
}
