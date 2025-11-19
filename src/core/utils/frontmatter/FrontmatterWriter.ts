// File: src/core/utils/file/FrontmatterWriter.ts
import { Vault, TFile, stringifyYaml, parseYaml } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * FrontmatterWriter
 * 既存frontmatterを安全に更新する責務限定クラス。
 * NoteFrontmatterParserと組み合わせて使用。
 */
export class FrontmatterWriter {
  constructor(private readonly vault: Vault) {}

  /** frontmatterを安全に上書きマージ */
  async update(file: TFile, newData: any): Promise<void> {
    let content = await this.vault.read(file);
    content = content.replace(/\r\n/g, '\n'); // 改行統一

    const yamlRegex = /^---\s*[\r\n]+([\s\S]*?)^---\s*[\r\n]*/m;
    const match = content.match(yamlRegex);

    let oldYaml: any = {};
    let body = content;

    if (match) {
      try {
        oldYaml = parseYaml(match[1]) ?? {};
      } catch (e) {
        logger.warn('[FrontmatterWriter] parse error', e);
      }
      body = content.substring(match[0].length);
    }

    const merged = { ...oldYaml, ...newData };

    const yamlText = stringifyYaml(merged).trimEnd();
    const newContent = `---\n${yamlText}\n---\n${body.trimStart()}`;

    await this.vault.modify(file, newContent);
    logger.debug(`[FrontmatterWriter] updated ${file.path}`);
  }
}
