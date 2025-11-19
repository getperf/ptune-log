import { Notice, type Plugin } from 'obsidian';
import { GoogleAuthSettings } from 'src/config/ConfigManager';
import { logger } from 'src/core/services/logger/loggerInstance';

/** Google OAuthトークンの管理（保存・期限チェック・リフレッシュ） */
export class TokenManager {
  constructor(
    private plugin: Plugin,
    private authSettings: GoogleAuthSettings
  ) {
    const { clientId, clientSecret } = this.authSettings;
    if (!clientId?.trim() || !clientSecret?.trim()) {
      logger.error('[TokenManager.constructor] Missing Client ID or Secret');
      throw new Error('Google 認証設定（Client ID / Secret）が未設定です');
    }
    logger.debug('[TokenManager.constructor] initialized', { clientId });
  }

  /** 有効なアクセストークンを取得する */
  async getValidAccessToken(): Promise<string | null> {
    const data = await this.plugin.loadData();
    if (!data) {
      logger.warn('[TokenManager.getValidAccessToken] no token data found');
      return null;
    }

    if (
      data?.access_token &&
      data?.expires_in &&
      data?.obtained_at &&
      !this.isTokenExpired(data.obtained_at, data.expires_in)
    ) {
      logger.debug('[TokenManager.getValidAccessToken] using cached token');
      return data.access_token;
    }

    if (data?.refresh_token) {
      logger.debug('[TokenManager.getValidAccessToken] refreshing token');
      return await this.refreshAccessToken(data.refresh_token);
    }

    logger.warn('[TokenManager.getValidAccessToken] no valid token available');
    return null;
  }

  /** トークンの有効期限を確認する */
  private isTokenExpired(obtainedAt: number, expiresIn: number): boolean {
    const now = Date.now();
    const expired = now > obtainedAt + expiresIn * 1000 - 60000;
    logger.debug('[TokenManager.isTokenExpired] check', { expired });
    return expired;
  }

  /** リフレッシュトークンを使ってアクセストークンを再取得する */
  private async refreshAccessToken(
    refreshToken: string
  ): Promise<string | null> {
    const { clientId, clientSecret } = this.authSettings;

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        const msg = `Google Auth HTTP error (${res.status}): ${text}`;
        logger.error('[TokenManager.refreshAccessToken] HTTP error', {
          status: res.status,
          text,
        });
        new Notice(msg, 8000);
        return null;
      }

      const tokens = await res.json();

      if (tokens.access_token) {
        await this.plugin.saveData({
          ...tokens,
          obtained_at: Date.now(),
          refresh_token: refreshToken,
        });
        logger.info('[TokenManager.refreshAccessToken] token refreshed');
        return tokens.access_token;
      } else {
        const msg = `Google Auth failed: ${JSON.stringify(tokens)}`;
        logger.error('[TokenManager.refreshAccessToken] token missing', tokens);
        new Notice(msg, 8000);
        return null;
      }
    } catch (e: any) {
      logger.error('[TokenManager.refreshAccessToken] exception', e);
      const msg = `Google Auth exception: ${e.message ?? e}`;
      new Notice(msg, 8000);
      return null;
    }
  }

  /** 初回トークンを保存する */
  async saveInitialTokens(tokens: any) {
    if (tokens.access_token) {
      await this.plugin.saveData({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        obtained_at: Date.now(),
      });
      logger.info('[TokenManager.saveInitialTokens] tokens saved');
    } else {
      logger.warn('[TokenManager.saveInitialTokens] no access token found');
    }
  }

  /** トークンをリセット（削除）する */
  async resetTokens(): Promise<void> {
    await this.plugin.saveData({});
    logger.info('[TokenManager.resetTokens] tokens reset');
  }
}
