import { App, Plugin, Notice } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { TagVectorBuilder } from './TagVectorBuilder';
import { logger } from 'src/core/services/logger/loggerInstance';

export class VectorCommandRegistrar {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) {}

  async register(plugin: Plugin): Promise<void> {
    logger.debug('[VectorCommandRegistrar.register] start');

    plugin.addCommand({
      id: 'test-embedding-api',
      name: 'LLM tags: Embedding API 接続テスト',
      callback: async () => {
        if (!this.llmClient.hasValidApiKey()) {
          new Notice('⚠️ LLM APIキーが設定されていません');
          return;
        }
        try {
          const vector = await this.llmClient.embed('test connection');
          if (!vector) {
            throw new Error('Embedding returned null vector');
          }
          new Notice(`✅ Embedding 接続成功 (length=${vector.length})`);
        } catch (err) {
          logger.error('[VectorCommandRegistrar] embedding test failed', err);
          new Notice('❌ Embedding API 接続に失敗しました');
        }
      },
    });
  }
}
