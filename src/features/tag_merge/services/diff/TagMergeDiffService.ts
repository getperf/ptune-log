// features/tag_merge/services/diff/TagMergeDiffService.ts

import { App } from 'obsidian';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { Tags } from 'src/core/models/tags/Tags';
import { TagVectors } from 'src/core/models/vectors/TagVectors';
import { TagExtractor } from 'src/features/tags/services/TagExtractor';
import { logger } from 'src/core/services/logger/loggerInstance';

export class TagMergeDiffService {
  constructor(
    private readonly app: App,
    private readonly llmClient: LLMClient,
  ) {}

  async detectMessages(): Promise<string[]> {
    const messages: string[] = [];

    // --- ノート由来タグ（未分類除外）
    const sourceMap = await TagExtractor.extractAllAsMap(this.app, {
      excludeUnclassified: true,
    });
    const sourceKeys = new Set(sourceMap.keys());

    // --- Tags DB
    const tags = new Tags();
    await tags.load(this.app.vault);
    const tagDbKeys = new Set(tags.getRawEntryMap().keys());

    const tagAdd = [...sourceKeys].filter((k) => !tagDbKeys.has(k)).length;
    const tagDel = [...tagDbKeys].filter((k) => !sourceKeys.has(k)).length;

    if (tagAdd > 0 || tagDel > 0) {
      messages.push(`タグDB: 追加 ${tagAdd} / 削除 ${tagDel}`);
    } else {
      messages.push('タグDB: 差分なし');
    }

    // --- Vector DB
    const vectors = new TagVectors(this.llmClient);
    await vectors.loadFromVault(this.app.vault);
    const vectorKeys = new Set(vectors.getRawEntryMap().keys());

    const vecAdd = [...sourceKeys].filter((k) => !vectorKeys.has(k)).length;
    const vecDel = [...vectorKeys].filter((k) => !sourceKeys.has(k)).length;

    if (vecAdd > 0 || vecDel > 0) {
      messages.push(`ベクトルDB: 追加 ${vecAdd} / 削除 ${vecDel}`);
      messages.push('※ ベクトル更新は時間・コストがかかります');
    } else {
      messages.push('ベクトルDB: 差分なし');
    }

    logger.debug(
      `[TagMergeDiffService] done: tagAdd=${tagAdd}, tagDel=${tagDel}, vecAdd=${vecAdd}, vecDel=${vecDel}`,
    );

    return messages;
  }
}
