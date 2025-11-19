import { App, Notice } from 'obsidian';
import { WinAppLauncher } from './WinAppLauncher';
import { WinAppUriBuilder } from './WinAppUriBuilder';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * Google OAuth 再認証コマンド
 * - token.json を削除し、WinUI アプリを /auth で起動
 */
export class TasksWinReauth {
  private readonly TOKEN_FILE = '.obsidian/plugins/ptune-log/work/token.json';

  constructor(private app: App) {}

  async execute(): Promise<void> {
    logger.info('[TasksWinReauth.execute] start');

    try {
      await this.app.vault.adapter.remove(this.TOKEN_FILE);
      logger.debug(`[TasksWinReauth] token.json removed`);
    } catch (e) {
      logger.warn(`[TasksWinReauth] token.json not found or failed`, e);
    }

    try {
      const uri = WinAppUriBuilder.buildAuth(this.app);
      const launcher = new WinAppLauncher(this.app.vault);
      const ok = await launcher.launchAndWait(uri, 'auth');

      if (ok) {
        logger.info('[TasksWinReauth] OAuth success');
        new Notice('Google OAuth 認証が完了しました', 8000);
      } else {
        logger.warn('[TasksWinReauth] OAuth failed');
        new Notice('Google OAuth 認証に失敗しました', 8000);
      }
    } catch (err) {
      logger.error('[TasksWinReauth] OAuth error', err);
      new Notice(
        `Google OAuth 認証中にエラーが発生しました: ${String(err)}`,
        8000
      );
    }
  }
}
