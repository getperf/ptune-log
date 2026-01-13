// src/features/daily_review/services/kpt/builders/KptMarkdownBlockBuilder.ts

import { DateUtil } from 'src/core/utils/date/DateUtil';

export class KptMarkdownBlockBuilder {
  private static readonly KIND = 'kpt-result';

  static build(bodyMarkdown: string, at: Date = new Date()): string {
    const time = DateUtil.localTime(at); // HH:MI

    return [
      `<!-- kind:${this.KIND} -->`,
      `${bodyMarkdown} (${time})`,
      `<!-- /kind -->`,
    ].join('\n');
  }
}
