// File: src/core/utils/frontmatter/NoteFrontmatterParser.ts
import { App, TFile, parseYaml } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

export interface ParsedFrontmatter {
  createdAt?: string;
  dailynote?: string;
  taskKey?: string;
  summary?: string;
  tags?: string[];
}

/**
 * YAML frontmatter 解析ユーティリティ
 * - createdAt, dailynote, taskKey, summary, tags などを抽出
 * - 旧 dailynoteDate は廃止
 */
export class NoteFrontmatterParser {
  /**
   * テキストからfrontmatterを直接解析
   * 対応形式:
   *   dailynote: "[[_journal/2025-11-11|2025-11-11]]"
   *   createdAt: 2025-11-11T12:00:00
   */
  static parse(text: string): ParsedFrontmatter {
    const match = text.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    try {
      logger.debug(`[NoteFrontmatterParser] start : ${match[1]}`);
      const fm = parseYaml(match[1]);

      const createdAt =
        typeof fm?.createdAt === 'string' ? fm.createdAt : undefined;
      const dailynote =
        typeof fm?.dailynote === 'string' ? fm.dailynote : undefined;
      const taskKey = typeof fm?.taskKey === 'string' ? fm.taskKey : undefined;
      const summary = typeof fm?.summary === 'string' ? fm.summary : '';
      const tags = Array.isArray(fm?.tags) ? fm.tags : [];

      logger.debug('[NoteFrontmatterParser] Parsed :', {
        createdAt,
        dailynote,
        taskKey,
        summary,
        tags,
      });

      return { createdAt, dailynote, taskKey, summary, tags };
    } catch (e) {
      logger.warn('[NoteFrontmatterParser] Invalid YAML detected');
      return {};
    }
  }

  /**
   * ObsidianのTFileからfrontmatterを解析
   * - Vaultからテキストを読み取り、parse() を呼び出す
   */
  static async parseFromFile(
    app: App,
    file: TFile
  ): Promise<ParsedFrontmatter> {
    try {
      const content = await app.vault.read(file);
      return this.parse(content);
    } catch (e) {
      logger.error(
        `[NoteFrontmatterParser.parseFromFile] failed: ${file.path}`,
        e
      );
      return {};
    }
  }

  /**
   * LLMタグ生成済みの判別
   */
  static isLLMTagGenerated(fm: ParsedFrontmatter): boolean {
    const hasTags = Array.isArray(fm?.tags) && fm.tags.length > 0;
    const hasSummary =
      typeof fm?.summary === 'string' && fm.summary.trim() !== '';
    return hasTags || hasSummary;
  }
}
