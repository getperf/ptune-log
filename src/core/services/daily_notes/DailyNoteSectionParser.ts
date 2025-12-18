// src/core/services/daily_notes/DailyNoteSectionParser.ts

import { logger } from 'src/core/services/logger/loggerInstance';

export class DailyNoteSectionParser {
  private static escape(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 見出し比較用キーを生成
   * - 絵文字・Variation Selector を除去
   * - 空白を正規化
   */
  private static normalizeHeadingKey(text: string): string {
    return text
      .normalize('NFKC')
      .replace(/\p{Extended_Pictographic}/gu, '')
      .replace(/\uFE0F/gu, '')
      .replace(/\s+/g, '')
      .trim();
  }

  static extractOnce(markdown: string, heading: string): string | undefined {
    return this.extractAll(markdown, heading)[0];
  }

  /**
   * 同一セクションをすべて取得
   * - ## / ### 対応
   * - 下位見出し（####）は本文に含める
   * - 終了条件は「次の ### 見出し」
   */
  static extractAll(markdown: string, heading: string): string[] {
    const targetKey = this.normalizeHeadingKey(heading);

    const lines = markdown.split('\n');
    const results: string[] = [];

    let collecting = false;
    let buffer: string[] = [];

    for (const line of lines) {
      const headingMatch = line.match(/^(#{2,3})\s+(.*)$/);

      if (headingMatch) {
        const key = this.normalizeHeadingKey(headingMatch[2]);

        // 新しい対象セクション開始
        if (key.startsWith(targetKey)) {
          if (collecting && buffer.length > 0) {
            results.push(buffer.join('\n').trim());
            buffer = [];
          }
          collecting = true;
          continue;
        }

        // 次の同レベル以上の見出しで終了
        if (collecting && headingMatch[1].length <= 3) {
          results.push(buffer.join('\n').trim());
          buffer = [];
          collecting = false;
        }
      }

      if (collecting) {
        buffer.push(line);
      }
    }

    if (collecting && buffer.length > 0) {
      results.push(buffer.join('\n').trim());
    }

    logger.debug(
      `[DailyNoteSectionParser] extractAll heading="${heading}" results=${results.length}`
    );

    return results.filter((r) => r.length > 0);
  }
}
