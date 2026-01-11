import { TFile, Vault } from 'obsidian';

export class PromptTemplateService {
  constructor(private vault: Vault) { }

  /**
   * system テンプレートと user テンプレートを読み込み、マージして変数展開する
   * @param systemPath system テンプレートのパス
   * @param userPath   user テンプレートのパス
   * @param variables  {{KEY}} 形式で置換する変数マップ
   */
  async mergeSystemAndUser(
    systemPath: string,
    userPath: string,
    variables: Record<string, string>
  ): Promise<string> {
    const system = await this.apply(systemPath, variables);
    const user = await this.apply(userPath, variables);
    return system.replace('{{USER_PROMPT}}', user);
  }

  async apply(
    templatePath: string,
    variables: Record<string, string>
  ): Promise<string> {
    const file = this.vault.getAbstractFileByPath(templatePath);
    if (!(file instanceof TFile)) {
      throw new Error(`テンプレートが見つかりません: ${templatePath}`);
    }
    const content = await this.vault.read(file);

    return content.replace(/\{\{(.*?)\}\}/g, (_, key) => {
      const k = key.trim();
      return variables[k] ?? '';
    });
  }
}
