import { TFile, Vault } from 'obsidian';

export class LLMPromptService {
  constructor(private vault: Vault) {}

  /**
   * system テンプレートと user テンプレートを読み込み、マージして変数展開する
   * @param systemPath system テンプレートのパス
   * @param userPath   user テンプレートのパス
   * @param data       {{KEY}} 形式で置換する変数マップ
   */
  async loadAndApply(
    systemPath: string,
    userPath: string,
    data: Record<string, string>
  ): Promise<string> {
    // system テンプレート読込
    const systemFile = this.vault.getAbstractFileByPath(systemPath);
    if (!(systemFile instanceof TFile)) {
      throw new Error(`system テンプレートが見つかりません: ${systemPath}`);
    }
    let systemContent = await this.vault.read(systemFile);

    // user テンプレート読込
    const userFile = this.vault.getAbstractFileByPath(userPath);
    if (!(userFile instanceof TFile)) {
      throw new Error(`user テンプレートが見つかりません: ${userPath}`);
    }
    const userContent = await this.vault.read(userFile);

    // 1. USER_PROMPT を差し込む
    if (!systemContent.includes('{{USER_PROMPT}}')) {
      console.warn('⚠ system テンプレートに {{USER_PROMPT}} が見つかりません');
    }
    systemContent = systemContent.replace('{{USER_PROMPT}}', userContent);

    // 2. 残りの変数を置換
    const merged = systemContent.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const k = key.trim();
      if (k === 'USER_PROMPT') return userContent; // 念のため
      return data[k] || '';
    });

    return merged;
  }
}
