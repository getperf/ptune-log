// src/features/daily_review/services/KptActionBlockBuilder.ts

import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';
import { getText } from './comment';

export class KptActionBlockBuilder {
  private static readonly COMMENT_KIND = 'review-point-action-comment';
  private static readonly LABEL_KIND = 'review-point-action-execute';

  static build(): string {
    const commentLines = getText(this.COMMENT_KIND);

    return MarkdownCommentBlock.build(commentLines);
  }
}
