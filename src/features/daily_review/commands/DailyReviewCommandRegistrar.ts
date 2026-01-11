// File: src/features/daily_review/commands/DailyReviewCommandRegistrar.ts
import { App, Plugin, TFolder } from 'obsidian';
import { DailyReviewUseCase } from '../application/DailyReviewUseCase';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * DailyReviewCommandRegistrar
 *
 * 責務:
 * - 日次振り返りの実行トリガーのみを登録する
 *
 * 非責務:
 * - LLM プロンプト設定
 * - テンプレート管理
 * - プロンプトプレビュー
 */
export class DailyReviewCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly useCase: DailyReviewUseCase
  ) { }

  register(plugin: Plugin): void {
    logger.debug('[DailyReviewCommandRegistrar.register] start');

    // --- フォルダ右クリック：振り返り実行 ---
    plugin.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFolder) {
          menu.addItem((item) =>
            item
              .setTitle('日次振り返り: このフォルダを実行')
              .setIcon('bot')
              .onClick(() => {
                logger.debug(
                  `[DailyReviewCommandRegistrar] runOnFolder: ${file.path}`
                );
                void this.useCase.runOnFolder(file);
              })
          );
        }
      })
    );

    // --- コマンド：今日の振り返り ---
    plugin.addCommand({
      id: 'daily-review-run-today',
      name: '日次振り返り: 今日を実行',
      callback: () => {
        logger.debug('[DailyReviewCommandRegistrar] command: runOnDate');
        void this.useCase.runOnDate();
      },
    });

    logger.debug('[DailyReviewCommandRegistrar.register] complete');
  }
}
