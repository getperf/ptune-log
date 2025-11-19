import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { logger } from 'src/core/services/logger/loggerInstance';
import { TagExtractor } from './TagExtractor';
import { TagVectorBuilder } from '../vector';

export class TagDBMaintainer {
  constructor(private app: App, private llmClient: LLMClient) {}

  async rebuildAll(): Promise<void> {
    logger.info('[TagDBMaintainer] start rebuild');
    const tags = await TagExtractor.extractAndGroup(this.app);
    await tags.save(this.app.vault);
    if (this.llmClient.hasEmbeddingModel()) {
      const builder = new TagVectorBuilder(this.app, this.llmClient);
      await builder.build();
    }
    logger.info('[TagDBMaintainer] completed');
  }
}
