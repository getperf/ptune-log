// src/features/daily_review/services/KptActionBlockBuilder.ts

import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';
import { getText } from '../i18n';

export class KptActionBlockBuilder {
  private static readonly COMMENT_KIND = 'kpt-action-comment';
  private static readonly LABEL_KIND = 'kpt-action-execute';

  static build(): string {
    const commentLines = getText(this.COMMENT_KIND);

    return MarkdownCommentBlock.build(commentLines);
  }
}
