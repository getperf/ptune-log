// src/features/note_analysis/services/builders/KptMarkdownConverter.ts

import { KPTResult } from 'src/core/models/daily_notes/KPTResult';
import { MarkdownCommentBlock } from 'src/core/utils/markdown/MarkdownCommentBlock';
import { i18n } from 'src/i18n';

/**
 * KptMarkdownConverter
 * - Outliner 前提の KPT Markdown を生成
 * - グループ間に空行を入れない（連続リスト）
 */
export class KptMarkdownConverter {
  static convert(result: KPTResult): string {
    const out: string[] = [];

    this.appendOutlinerHelp(out);

    this.appendGroup(out, '*Keep*', result.Keep);
    this.appendGroup(out, '*Problem*', result.Problem);
    this.appendGroup(out, '*Try*', result.Try);

    return out.join('\n');
  }

  /**
   * 冒頭コメント：Outliner 用の最小操作ガイド
   */
  private static appendOutlinerHelp(out: string[]): void {
    const comment = i18n.ui.noteAnalysis.kpt.outliner.comment;

    out.push(MarkdownCommentBlock.build([comment.title, comment.body]));
  }

  /**
   * K / P / T グループ出力
   * - 親ノード = グループ
   * - 子ノード = 各項目
   * - グループ間に空行は入れない
   */
  private static appendGroup(
    out: string[],
    label: string,
    items: string[]
  ): void {
    if (!items || items.length === 0) return;

    out.push(`- ${label}`);
    for (const item of items) {
      out.push(`  - ${item}`);
    }
  }
}
