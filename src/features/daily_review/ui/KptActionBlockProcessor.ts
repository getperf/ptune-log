// src/features/daily_review/ui/KptActionBlockProcessor.ts

import { App, Plugin, MarkdownPostProcessorContext, Notice } from 'obsidian';

export class KptActionBlockProcessor {
  constructor(private readonly app: App, private readonly plugin: Plugin) {}

  register(): void {
    this.plugin.registerMarkdownCodeBlockProcessor(
      'kpt-action',
      (source, el, ctx) => this.render(source, el, ctx)
    );
  }

  private render(
    source: string,
    el: HTMLElement,
    _ctx: MarkdownPostProcessorContext
  ): void {
    const label =
      source
        .split('\n')
        .find((l) => l.startsWith('label:'))
        ?.replace('label:', '')
        .trim() ?? 'KPT分析';

    const button = el.createEl('button', {
      text: label,
      cls: 'kpt-action-button',
    });

    button.onclick = () => {
      new Notice('KPT分析（スケルトン）を実行しました');
    };
  }
}
