import { App, Plugin, TFile, Notice } from 'obsidian';
import { LLMPromptService } from 'src/core/services/llm/LLMPromptService';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { NoteReviewService } from './NoteReviewService';
import { NoteReviewModal } from './NoteReviewModal';
import { logger } from 'src/core/services/logger/loggerInstance';

export class NoteReviewCommandRegistrar {
  private reviewService: NoteReviewService;
  private promptService: LLMPromptService;

  constructor(private readonly app: App, private readonly client: LLMClient) {
    this.reviewService = new NoteReviewService(app, client);
    this.promptService = new LLMPromptService(app.vault);
  }

  register(plugin: Plugin): void {
    logger.debug('[NoteReviewCommandRegistrar] register commands');

    plugin.addCommand({
      id: 'ptune-note-review',
      name: 'レビュー: 現在のノートをLLMで解析・確認',
      callback: async () => {
        const file = this.app.workspace.getActiveFile();
        if (!file) {
          new Notice('アクティブなノートがありません。');
          return;
        }

        try {
          await this.openReviewModal(file);
        } catch (e) {
          logger.error('[NoteReviewCommandRegistrar] error', e);
          new Notice('レビュー処理中にエラーが発生しました');
        }
      },
    });
  }

  /**
   * review modal 実行（preview → UI）
   */
  private openReviewModal(file: TFile): void {
    logger.debug(`[NoteReview] open modal only: ${file.path}`);
    new NoteReviewModal(this.app, this.reviewService, file).open();
  }
}
