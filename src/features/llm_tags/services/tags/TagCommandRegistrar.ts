// src/features/llm_tags/services/tags/TagCommandRegistrar.ts
import { App, Plugin, Notice } from 'obsidian';
import { TagAliasMerger } from './TagAliasMerger';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagDBMaintainer } from './TagDBMaintainer';

export class TagCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) { }

  register(plugin: Plugin) {
    logger.debug('[TagCommandRegistrar.register] start');

    plugin.addCommand({
      id: 'rebuild-tag-db',
      name: 'LLM tags: タグ辞書を再構築',
      callback: async () => {
        new Notice('⏳ タグ辞書の再構築を開始しました', 8000);
        logger.info('[TagCommandRegistrar] rebuild-tag-db start');

        void (async () => {
          try {
            const maint = new TagDBMaintainer(this.app, this.llmClient);
            await maint.rebuildAll();
            new Notice('✅ タグ辞書の更新が完了しました', 10000);
            logger.info('[TagCommandRegistrar] rebuild-tag-db completed');
          } catch (err) {
            logger.error('[TagCommandRegistrar] rebuild-tag-db failed', err);
            new Notice('❌ タグ辞書再構築に失敗しました', 10000);
          }
        })();
      },
    });

    plugin.addCommand({
      id: 'merge-tag-aliases',
      name: 'LLM tags: エイリアス辞書にタグを登録・マージ',
      callback: async () => {
        const merger = new TagAliasMerger(this.app, this.llmClient);
        await merger.run();
        new Notice('✅ タグエイリアス辞書更新');
      },
    });
  }
}
