import { TFile, Vault } from 'obsidian';
import { parseYaml, stringifyYaml } from 'obsidian';

/* YAMLコードブロックの抽出と、Markdownファイルのfrontmatter更新ユーティリティ */
export class YamlProcessor2 {
  constructor(private vault: Vault) {}

  /* 入力文字列から ```yaml ... ``` コードブロックを抽出する（fallbackあり） */
  extractYamlBlock(raw: string): string {
    // ```yaml ... ``` または ``` ... ```
    const match = raw.match(/```(?:yaml)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return match[1].trim();
    }

    // Fallback: コードブロックなしだが YAMLらしければ返す
    const trimmed = raw.trim();
    if (
      trimmed.startsWith('summary:') ||
      trimmed.startsWith('tags:') ||
      trimmed.startsWith('---')
    ) {
      return trimmed;
    }

    // 不正な場合は null の代わりに安全な空値
    console.warn('⚠ YAML block not found or malformed');
    return '';
  }

  /* Markdownファイルのfrontmatterを指定データでマージ更新する */
  async updateFrontmatter(file: TFile, newData: any): Promise<void> {
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
        console.warn('[YamlProcessor] YAML parse error:', e);
      }
      body = content.substring(match[0].length);
    }

    if (Array.isArray(newData.tags)) {
      newData.tags = this.cleanseTags(newData.tags);
    }

    const merged = { ...oldYaml, ...newData };

    // body の先頭に残存セパレータがあれば除去
    body = body.replace(/^---[\s\S]*?---\s*/m, '');

    const yamlText = stringifyYaml(merged).trimEnd();
    const newContent = `---\n${yamlText}\n---\n${body.trimStart()}`;

    await this.vault.modify(file, newContent);
  }

  /* タグ配列から空要素・記号・重複スラッシュなどを除去して正規化する */
  private cleanseTags(tags: string[]): string[] {
    return tags
      .filter(Boolean)
      .map((tag) =>
        tag
          .replace(/[#@:\.\s]+/g, '/')
          .replace(/\/+/g, '/')
          .replace(/^\/|\/$/g, '')
          .trim()
      )
      .filter((tag) => /^[\p{L}\p{N}_\/-]+$/u.test(tag));
  }
}
