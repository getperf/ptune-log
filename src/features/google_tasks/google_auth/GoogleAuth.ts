import { Notice, Plugin } from 'obsidian';
import { TokenManager } from './TokenManager';
import { logger } from 'src/core/services/logger/loggerInstance';
import { GoogleAuthSettings } from 'src/config/ConfigManager';

/** Google OAuth2 (PKCE対応) 認証クラス */
export class GoogleAuth {
  constructor(private plugin: Plugin, private settings: GoogleAuthSettings) {
    logger.debug('[GoogleAuth.constructor] initialized');
  }

  /** 設定内容を検証する */
  validateSettings(): boolean {
    const { clientId, clientSecret } = this.settings;
    if (!clientId || !clientSecret) {
      new Notice('Google OAuth設定（Client ID / Secret）が未入力です。');
      logger.warn(
        '[GoogleAuth.validateSettings] missing clientId or clientSecret'
      );
      return false;
    }
    logger.debug('[GoogleAuth.validateSettings] valid settings');
    return true;
  }

  /** 有効なアクセストークンを確保する（必要なら認証処理を実行） */
  async ensureAccessToken(): Promise<string | null> {
    if (!this.validateSettings()) return null;

    const { clientId, clientSecret } = this.settings;
    const tokenManager = new TokenManager(this.plugin, this.settings);
    const existingToken = await tokenManager.getValidAccessToken();
    if (existingToken) {
      logger.debug('[GoogleAuth.ensureAccessToken] using existing token');
      return existingToken;
    }

    // --- PKCE パラメータ生成 ---
    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.sha256Base64Url(codeVerifier);
    logger.debug('[GoogleAuth.ensureAccessToken] PKCE generated', {
      codeChallenge,
    });

    // --- ローカルサーバで認可コードを受け取る ---
    const port = 42813;
    const redirectUri = `http://localhost:${port}/callback`;
    const scope = 'https://www.googleapis.com/auth/tasks email';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(
      scope
    )}&access_type=offline&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    logger.debug('[GoogleAuth.ensureAccessToken] opening browser for auth');
    window.open(authUrl, '_blank');

    let code: string;
    try {
      code = await this.waitForAuthCode(port);
      logger.debug('[GoogleAuth.ensureAccessToken] auth code received');
    } catch (e) {
      logger.error('[GoogleAuth.ensureAccessToken] failed to get auth code', e);
      new Notice('認可コードの取得に失敗しました。');
      return null;
    }

    // --- トークン交換 ---
    try {
      logger.debug('[GoogleAuth.ensureAccessToken] exchanging token');
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
        }),
      });

      const tokens = await tokenRes.json();

      if (tokens.access_token) {
        await tokenManager.saveInitialTokens(tokens);
        logger.info('[GoogleAuth.ensureAccessToken] token obtained');
        return tokens.access_token;
      }

      const err = tokens?.error ?? 'unknown error';
      const desc = tokens?.error_description ?? '';
      logger.error('[GoogleAuth.ensureAccessToken] token exchange failed', {
        error: err,
        desc,
      });
      new Notice(`Google 認証エラー: ${err}\n${desc}`);
      return null;
    } catch (e) {
      logger.error(
        '[GoogleAuth.ensureAccessToken] exception during token exchange',
        e
      );
      new Notice('トークン交換中にエラーが発生しました。');
      return null;
    }
  }

  /** 再認証を実行してトークンを再取得する */
  async reauthorize(): Promise<boolean> {
    if (!this.validateSettings()) return false;
    const tokenManager = new TokenManager(this.plugin, this.settings);
    await tokenManager.resetTokens();
    const token = await this.ensureAccessToken();
    const success = token !== null;
    logger.info('[GoogleAuth.reauthorize] completed', { success });
    return success;
  }

  /** ランダムな文字列を生成する */
  private generateRandomString(length: number): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    const result = Array.from(array)
      .map((x) => chars[x % chars.length])
      .join('');
    return result;
  }

  /** SHA256ハッシュをBase64URL形式で返す */
  private async sha256Base64Url(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(hashBuffer);
    let str = '';
    for (let i = 0; i < bytes.length; ++i) {
      str += String.fromCharCode(bytes[i]);
    }
    const result = btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return result;
  }

  /** ローカルサーバで認可コードを待機する */
  private waitForAuthCode(port: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = (window as any)
        .require('http')
        .createServer((req: any, res: any) => {
          const url = new URL(req.url, `http://localhost:${port}`);
          const code = url.searchParams.get('code');
          if (code) {
            logger.debug('[GoogleAuth.waitForAuthCode] code received');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(
              '<html><body><h2>認証が完了しました。このウィンドウを閉じてください。</h2></body></html>'
            );
            server.close();
            resolve(code);
          } else {
            logger.warn('[GoogleAuth.waitForAuthCode] code not found');
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(
              '<html><body><h2>認証コードが見つかりません。</h2></body></html>'
            );
            server.close();
            reject(new Error('認証コードが見つかりません'));
          }
        });
      server.listen(port);
      logger.debug('[GoogleAuth.waitForAuthCode] server listening', { port });
    });
  }
}
