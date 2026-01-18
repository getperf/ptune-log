// src/features/tag_merge/application/TagMergeUseCase.ts
import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { TagMergeService } from '../services/TagMergeService';
import { TagMergeResultDialog } from '../ui/TagMergeResultDialog';
import { logger } from 'src/core/services/logger/loggerInstance';

export class TagMergeUseCase {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient
  ) {}

  async execute(): Promise<void> {
    logger.debug('[TagMergeUseCase] start');

    const vectors = new TagVectors(this.llmClient);
    await vectors.loadFromVault(this.app.vault);

    const service = new TagMergeService();
    const clusters = await service.cluster(vectors);

    new TagMergeResultDialog(this.app, clusters).open();

    logger.debug('[TagMergeUseCase] complete');
  }
}
