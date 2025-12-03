import { App, Notice } from 'obsidian';
import { TagRenamer } from './TagRenamer';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagSuggestionService } from 'src/features/llm_tags/services/tags/TagSuggestionService';
import { TagAliasUpdater } from 'src/features/llm_tags/services/tags/TagAliasUpdater';
import { TagEditDialog } from 'src/features/llm_tags/services/tags/TagEditDialog';
import { ErrorUtils } from 'src/core/utils/common/ErrorUtils';

/**
 * Tagアクション共通サービス
 * - Rename / Delete 操作を共通化
 * - ContextMenu, コマンドパレットなど複数の呼び出し元から利用可
 */
export class TagActionService {
  private candidateService: TagSuggestionService;

  constructor(private app: App, private llmClient: LLMClient) {
    this.candidateService = new TagSuggestionService(app, llmClient);
    logger.debug('[TagActionService] initialized');
  }

  /** タグ名変更処理 */
  async rename(tagName: string): Promise<void> {
    logger.debug(`[TagActionService.rename] start: tagName=${tagName}`);
    const updater = new TagAliasUpdater(this.app);
    await updater.ensureLoaded();

    const dialog = new TagEditDialog(this.app, this.llmClient, {
      from: tagName,
      to: '', // renameなので初期値なし
      mode: 'rename',
      onSubmit: async (from, to) => {
        logger.debug(
          `[TagActionService.rename] execute rename: from=${from}, to=${to}`
        );
        try {
          const renamer = new TagRenamer(this.app, updater);
          await renamer.rename(from, to);
          await updater.save();
          new Notice(`Renamed #${from} → #${to}`);
          logger.info(`[TagActionService.rename] success: ${from} → ${to}`);
        } catch (err) {
          const msg = ErrorUtils.toMessage(err);
          logger.error(`[TagActionService.rename] failed: ${msg}`);
          new Notice(`Rename failed: ${msg}`);
        }
      },
    });
    dialog.open();
  }

  /** タグ無効化 */
  async disable(tagName: string): Promise<void> {
    logger.debug(`[TagActionService.disable] start: tagName=${tagName}`);
    try {
      const updater = new TagAliasUpdater(this.app);
      await updater.ensureLoaded();

      const renamer = new TagRenamer(this.app, updater);
      await renamer.rename(tagName, '1'); // 無効タグ #1 に置換
      await updater.save();

      new Notice(`#${tagName} を無効化しました（#1 に置換）`);
      logger.info(`[TagActionService.disable] success: ${tagName} → #1`);
    } catch (err) {
      const msg = ErrorUtils.toMessage(err);
      logger.error(`[TagActionService.disable] failed: ${msg}`);
      new Notice(`無効化失敗: ${msg}`);
    }
  }
}
