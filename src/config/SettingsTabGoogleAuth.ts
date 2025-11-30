import { Setting } from 'obsidian';
import type { PluginSettings, ConfigManager } from './ConfigManager';

/**
 * Google認証設定セクションを描画
 * @param containerEl - 設定タブのコンテナ要素
 * @param config - 設定マネージャ（ConfigManagerインスタンス）
 * @param settings - 現在の設定状態（表示用）
 */
export function renderGoogleAuthSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings
) {
  // ① 既存のセクション削除
  const section = containerEl.querySelector(
    '.google-auth-section'
  );
  if (section) section.remove();

  // ② 新しいセクションを作成
  // section = containerEl.createDiv({ cls: 'google-auth-section' });
  const newSection = containerEl.createDiv({ cls: 'google-auth-section' });
  newSection.createEl('h3', { text: 'Google 認証設定' });

  // トグル
  new Setting(newSection)
    .setName('Windowsアプリで認証を行う')
    .setDesc('Windows 版の外部認証アプリを使用します。')
    .addToggle((toggle) =>
      toggle
        .setValue(settings.google_auth.useWinApp)
        .onChange(async (value) => {
          await config.update('google_auth.useWinApp', value);
          renderGoogleAuthSettings(containerEl, config, config.settings); // 再描画
        })
    );

  const disabled = settings.google_auth.useWinApp;

  // Client ID
  new Setting(newSection)
    .setName('Client ID')
    .setDesc('Google Cloud Console の OAuth2 Client ID')
    .addText((text) =>
      text
        .setPlaceholder('xxxxxxxx.apps.googleusercontent.com')
        .setValue(settings.google_auth.clientId)
        .setDisabled(disabled)
        .onChange(async (value) => {
          await config.update('google_auth.clientId', value.trim());
        })
    );

  // Client Secret
  new Setting(newSection)
    .setName('Client secret')
    .setDesc('Google Cloud Console の OAuth2 Client secret')
    .addText((text) =>
      text
        .setPlaceholder('xxxxxxxxxxxxxxx')
        .setValue(settings.google_auth.clientSecret)
        .setDisabled(disabled)
        .onChange(async (value) => {
          await config.update('google_auth.clientSecret', value.trim());
        })
    );
}
