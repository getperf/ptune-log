// src/features/daily_review/services/KptActionBlockBuilder.ts

export class KptActionBlockBuilder {
  static build(): string {
    const comment = `
※ レビュー欄の内容が KPT分析に反映されます。
　修正・追記後に KPT分析を実行してください。
`.trim();

    const actionBlock = `
\`\`\`kpt-action
label: KPT分析実行
\`\`\`
`.trim();

    return [comment, '', actionBlock].join('\n');
  }
}
