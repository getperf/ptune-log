// src/features/daily_review/services/KptActionBlockBuilder.ts

import { getText } from '../i18n';

export class KptActionBlockBuilder {
  private static readonly COMMENT_KIND = 'kpt-action-comment';
  private static readonly LABEL_KIND = 'kpt-action-execute';

  static build(): string {
    const commentLines = getText(this.COMMENT_KIND);
    const label = getText(this.LABEL_KIND);

    const actionBlock = `
\`\`\`kpt-action
label: ${label}
\`\`\`
`.trim();

    return [
      `<!-- kind:${this.COMMENT_KIND} -->`,
      ...commentLines,
      actionBlock,
      `<!-- /kind -->`,
    ].join('\n');
  }
}
