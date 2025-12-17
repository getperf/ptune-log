// File: src/features/llm_tags/services/analysis/KPTMarkdownBuilder.ts

import { KPTResult } from './KPTAnalyzer';

export class KPTMarkdownBuilder {
  static build(kpt: KPTResult, index?: number): string {
    const title =
      index && index > 1 ? `### 🧠 KPT分析(${index})` : '### 🧠 KPT分析';

    return [
      title,
      '',
      '#### Keep',
      ...this.buildList(kpt.Keep),
      '',
      '#### Problem',
      ...this.buildList(kpt.Problem),
      '',
      '#### Try',
      ...this.buildList(kpt.Try),
    ].join('\n');
  }

  /**
   * 箇条書きを生成
   * - 要素が 0 件の場合は空行用に `- ` を 1 行返す
   */
  private static buildList(items: string[]): string[] {
    if (!items || items.length === 0) {
      return ['- '];
    }
    return items.map((item) => `- ${item}`);
  }
}
