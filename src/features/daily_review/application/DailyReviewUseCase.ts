// File: src/features/daily_review/application/DailyReviewUseCase.ts

import { App, Notice, TFolder } from 'obsidian';
import { DailyReviewModal } from '../ui/DailyReviewModal';
import { NoteAnalysisRunner } from '../../../core/services/llm/note_analysis/NoteAnalysisRunner';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { NoteAnalysisPromptService } from 'src/core/services/llm/note_analysis/NoteAnalysisPromptService';
import { DailyReviewApplier } from '../services/DailyReviewApplier';
import { logger } from 'src/core/services/logger/loggerInstance';
import { i18n } from 'src/i18n';

export class DailyReviewUseCase {
  constructor(
    private readonly app: App,
    private readonly client: LLMClient,
    private readonly runner: NoteAnalysisRunner,
    private readonly reviewSettings: ReviewSettings
  ) {}

  async runOnFolder(folder: TFolder): Promise<void> {
    logger.info('[DailyReview] runOnFolder start', { folder: folder.path });

    if (!this.client.hasValidApiKey()) {
      logger.warn('[DailyReview] API key not set');
      // i18n置換：「APIキー未設定」
      new Notice(`⚠️ ${i18n.ui.shared.notice.apiKeyNotSet}`);
      return;
    }

    const files = this.runner.findFilesInFolder(folder);
    logger.info('[DailyReview] files found', { count: files.length });

    if (!files.length) {
      logger.warn('[DailyReview] no markdown files in folder');
      // i18n置換：「Markdownファイルが見つかりません」
      new Notice(`⚠️ ${i18n.ui.dailyReview.notice.noMarkdownFiles}`);
      return;
    }

    const prompt = await NoteAnalysisPromptService.build(this.app);
    logger.debug('[DailyReview] prompt built');

    const modal = new DailyReviewModal(this.app, {
      mode: 'folder',
      initialFiles: files,
      onConfirm: async (modal, files) => {
        logger.info('[DailyReview] confirm (folder)', {
          fileCount: files.length,
        });

        void this.runner
          .runOnFiles(files, prompt, modal)
          .then(() => {
            logger.info('[DailyReview] runOnFolder completed');
            modal.close();
          })
          .catch((e) => {
            logger.error('[DailyReview] runOnFolder failed', e);
            // i18n置換：「振り返り処理中にエラーが発生しました」
            new Notice(`⚠️ ${i18n.ui.dailyReview.notice.failed}`);
          });
      },
    });

    modal.open();
  }

  /** --- 日付指定（振り返り） */
  async runOnDate(): Promise<void> {
    logger.info('[DailyReview] runOnDate start');

    if (!this.client.hasValidApiKey()) {
      logger.warn('[DailyReview] API key not set');
      // i18n置換：「APIキー未設定」
      new Notice(`⚠️ ${i18n.ui.shared.notice.apiKeyNotSet}`);
      return;
    }

    const initialDate = new Date();
    const initialFiles = await this.runner.findFilesByDate(initialDate);

    logger.info('[DailyReview] initial files by date', {
      date: initialDate.toISOString(),
      count: initialFiles.length,
    });

    const prompt = await NoteAnalysisPromptService.build(this.app);
    logger.debug('[DailyReview] prompt built');

    const applier = new DailyReviewApplier(this.app, this.reviewSettings);

    const modal = new DailyReviewModal(this.app, {
      mode: 'date',
      initialDate,
      initialFiles,
      onDateChange: (date) => {
        logger.debug('[DailyReview] date changed', {
          date: date.toISOString(),
        });
        return this.runner.findFilesByDate(date);
      },

      onConfirm: (modal, files, selectedDate, forceRegenerate) => {
        void this.runner
          .runOnFiles(files, prompt, modal, forceRegenerate)
          .then((summaries) => {
            logger.info('[DailyReview] analysis completed, applying result');
            return applier.apply(selectedDate, summaries);
          })
          .then(() => {
            logger.info('[DailyReview] apply completed');
            // i18n置換：「今日の振り返りが完了しました」
            modal.showCompletionMessage(
              `✅ ${i18n.ui.dailyReview.message.completed}`
            );
            setTimeout(() => modal.close(), 1500);
          })
          .catch((e) => {
            logger.error('[DailyReview] runOnDate failed', e);
            // i18n置換：「振り返り処理中にエラーが発生しました」
            new Notice(`⚠️ ${i18n.ui.dailyReview.notice.failed}`);
          });
      },
    });

    modal.open();
  }
}
