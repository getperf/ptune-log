import { App, normalizePath, TFile, TFolder, Vault } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { RequiredPluginInfo } from 'src/features/setup/InitialSetupManager';

/**
 * --- Utils
 * Obsidian の操作全般に関する汎用ユーティリティ関数群。
 * Vaultパス、テーマ設定、プラグイン状態、ファイル抽出などを提供。
 */
export class Utils {
  /** --- Vaultホームパスを返す（Windows対応） */
  static resolveVaultHome(app: App): string {
    const adapter = app.vault.adapter as any;
    const basePath = adapter?.basePath ?? '';
    logger.debug(`[Utils.resolveVaultHome] basePath=${basePath}`);
    return basePath;
  }

  /** --- 現在のObsidianテーマ名を取得する */
  static async getCurrentTheme(app: App): Promise<string | null> {
    const path = normalizePath('.obsidian/appearance.json');
    logger.debug(`[Utils.getCurrentTheme] reading ${path}`);

    try {
      const content = await app.vault.adapter.read(path);
      const json = JSON.parse(content);
      const theme = json.cssTheme || null;
      logger.debug(`[Utils.getCurrentTheme] current theme=${theme}`);
      return theme;
    } catch (err) {
      logger.error('[Utils.getCurrentTheme] 読み込み失敗', err);
      return null;
    }
  }

  /** --- 指定プラグインが有効かどうか判定する */
  static isPluginEnabled(app: App, pluginId: string, isCore: boolean): boolean {
    const anyApp = app as any;
    const enabled = isCore
      ? anyApp.internalPlugins?.plugins?.[pluginId]?.enabled ?? false
      : anyApp.plugins?.enabledPlugins?.has(pluginId) ?? false;

    logger.debug(
      `[Utils.isPluginEnabled] plugin=${pluginId}, core=${isCore}, enabled=${enabled}`
    );
    return enabled;
  }

  /** --- プラグインIDから Obsidian プラグイン情報を取得する */
  static getAnyPlugin(app: App, pluginId: string, isCore: boolean): any | null {
    const anyApp = app as any;

    if (isCore) {
      const corePlugin = anyApp.internalPlugins?.plugins?.[pluginId];
      if (!corePlugin) {
        logger.warn(
          `[Utils.getAnyPlugin] コアプラグイン "${pluginId}" は存在しません`
        );
        return null;
      }
      logger.debug(`[Utils.getAnyPlugin] コアプラグイン取得: ${pluginId}`);
      return corePlugin;
    } else {
      const pluginInstance = anyApp.plugins?.plugins?.[pluginId];
      if (!pluginInstance) {
        logger.warn(
          `[Utils.getAnyPlugin] カスタムプラグイン "${pluginId}" はロードされていません`
        );
        return null;
      }
      logger.debug(`[Utils.getAnyPlugin] カスタムプラグイン取得: ${pluginId}`);
      return pluginInstance;
    }
  }

  /** --- 必須プラグインの公式URLを返す */
  static getPluginUrl(plugin: RequiredPluginInfo): string {
    const url = plugin.isCore
      ? `https://help.obsidian.md/Plugins/${encodeURIComponent(plugin.name)}`
      : `https://obsidian.md/plugins?id=${plugin.id}#`;
    logger.debug(`[Utils.getPluginUrl] ${url}`);
    return url;
  }

  /** --- テーマ検索URLを生成する */
  static getThemeUrl(themeName: string): string {
    const url = `https://obsidian.md/themes?search=${encodeURIComponent(
      themeName
    )}`;
    logger.debug(`[Utils.getThemeUrl] ${url}`);
    return url;
  }

  /** --- 現在日時から日付プレフィックスを返す（例: 20250604153000） */
  static getDatePrefix(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const result = `${yyyy}${MM}${dd}${hh}${mm}${ss}`;
    logger.debug(`[Utils.getDatePrefix] ${result}`);
    return result;
  }

  /** --- ファイルエクスプローラ上でノートをフォーカスする */
  static focusFileInExplorer(app: App, file: TFile): void {
    logger.debug(`[Utils.focusFileInExplorer] reveal ${file.path}`);
    app.workspace.trigger('reveal', file);
  }

  /** --- ファイルの全行を読み込む */
  static async readFileLines(app: App, file: TFile): Promise<string[]> {
    const content = await app.vault.read(file);
    const lines = content.split(/\r?\n/);
    logger.debug(
      `[Utils.readFileLines] file=${file.path}, lines=${lines.length}`
    );
    return lines;
  }

  /** --- 指定キーワードを含む見出しセクションを抽出する */
  static async readSectionLines(
    app: App,
    file: TFile,
    headingKeyword: string
  ): Promise<string[]> {
    logger.debug(
      `[Utils.readSectionLines] file=${file.path}, keyword=${headingKeyword}`
    );
    const lines = await Utils.readFileLines(app, file);
    const section = Utils.extractSectionLines(lines, headingKeyword);
    logger.debug(`[Utils.readSectionLines] extracted lines=${section.length}`);
    return section;
  }

  /** --- 行配列から見出し〜次見出し／水平線までのブロックを抽出する */
  static extractSectionLines(
    lines: string[],
    headingKeyword: string
  ): string[] {
    const isHeading = (line: string) => line.trim().startsWith('#');
    const isHorizontalRule = (line: string) =>
      /^\s{0,3}(-{3,}|_{3,}|\*{3,})\s*$/.test(line);

    let startIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (isHeading(lines[i]) && lines[i].includes(headingKeyword)) {
        startIndex = i + 1;
        break;
      }
    }

    if (startIndex === -1) {
      logger.debug(
        `[Utils.extractSectionLines] heading not found: ${headingKeyword}`
      );
      return [];
    }

    let endIndex = lines.length;
    for (let i = startIndex; i < lines.length; i++) {
      if (isHeading(lines[i]) || isHorizontalRule(lines[i])) {
        endIndex = i;
        break;
      }
    }

    logger.debug(
      `[Utils.extractSectionLines] start=${startIndex}, end=${endIndex}`
    );
    return lines.slice(startIndex, endIndex);
  }
}
