import { App, normalizePath, TFile, Vault } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { RequiredPluginInfo } from 'src/features/setup/InitialSetupManager';

/**
 * --- Utils
 * Obsidian の操作全般に関する汎用ユーティリティ関数群。
 * Vaultパス、テーマ設定、プラグイン状態、ファイル抽出などを提供。
 */
export class Utils {
  /** Vaultホームパスを返す（Windows対応） */
  static resolveVaultHome(app: App): string {
    const basePath = app.vault.adapter.basePath ?? '';
    logger.debug(`[Utils.resolveVaultHome] basePath=${basePath}`);
    return basePath;
  }

  /** 現在のObsidianテーマ名を取得する */
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

  /** 指定プラグインが有効かどうか判定する */
  static isPluginEnabled(app: App, pluginId: string, isCore: boolean): boolean {
    const enabled = isCore
      ? app.internalPlugins?.plugins?.[pluginId]?.enabled ?? false
      : app.plugins?.enabledPlugins?.has(pluginId) ?? false;

    logger.debug(
      `[Utils.isPluginEnabled] plugin=${pluginId}, core=${isCore}, enabled=${enabled}`
    );
    return enabled;
  }

  /** プラグインIDから Obsidian プラグイン情報を取得する */
  static getAnyPlugin(
    app: App,
    pluginId: string,
    isCore: boolean
  ): unknown | null {
    if (isCore) {
      const corePlugin = app.internalPlugins?.plugins?.[pluginId];
      if (!corePlugin) {
        logger.warn(`[Utils.getAnyPlugin] コア "${pluginId}" は存在しません`);
        return null;
      }
      logger.debug(`[Utils.getAnyPlugin] コアプラグイン取得: ${pluginId}`);
      return corePlugin;
    } else {
      const pluginInstance = app.plugins?.plugins?.[pluginId];
      if (!pluginInstance) {
        logger.warn(`[Utils.getAnyPlugin] プラグイン "${pluginId}" 未ロード`);
        return null;
      }
      logger.debug(`[Utils.getAnyPlugin] カスタムプラグイン取得: ${pluginId}`);
      return pluginInstance;
    }
  }

  /** 必須プラグインURL */
  static getPluginUrl(plugin: RequiredPluginInfo): string {
    const url = plugin.isCore
      ? `https://help.obsidian.md/Plugins/${encodeURIComponent(plugin.name)}`
      : `https://obsidian.md/plugins?id=${plugin.id}#`;
    logger.debug(`[Utils.getPluginUrl] ${url}`);
    return url;
  }

  /** テーマ検索URL */
  static getThemeUrl(themeName: string): string {
    const url = `https://obsidian.md/themes?search=${encodeURIComponent(
      themeName
    )}`;
    logger.debug(`[Utils.getThemeUrl] ${url}`);
    return url;
  }

  /** 日付プレフィックス */
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

  /** ノートをエクスプローラでフォーカス */
  static focusFileInExplorer(app: App, file: TFile): void {
    logger.debug(`[Utils.focusFileInExplorer] reveal ${file.path}`);
    app.workspace.trigger('reveal', file);
  }

  /** ファイル全行読み込み */
  static async readFileLines(app: App, file: TFile): Promise<string[]> {
    const content = await app.vault.read(file);
    return content.split(/\r?\n/);
  }

  /** 指定キーワードを含むセクションを抽出 */
  static async readSectionLines(
    app: App,
    file: TFile,
    headingKeyword: string
  ): Promise<string[]> {
    const lines = await Utils.readFileLines(app, file);
    return Utils.extractSectionLines(lines, headingKeyword);
  }

  /** 行配列からセクション抽出 */
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

    if (startIndex === -1) return [];

    let endIndex = lines.length;
    for (let i = startIndex; i < lines.length; i++) {
      if (isHeading(lines[i]) || isHorizontalRule(lines[i])) {
        endIndex = i;
        break;
      }
    }

    return lines.slice(startIndex, endIndex);
  }

  /** --- 例外オブジェクトを安全に文字列化する */
  static safeErrorMessage(e: unknown): string {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
}
