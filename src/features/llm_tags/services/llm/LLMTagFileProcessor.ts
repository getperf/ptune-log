import { App, TFile, parseYaml } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteSummary } from 'src/core/models/notes/NoteSummary';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { NoteFrontmatterParser } from 'src/core/utils/frontmatter/NoteFrontmatterParser';
import { LLMYamlExtractor } from 'src/features/llm_tags/services/llm/LLMYamlExtractor';
import { FrontmatterWriter } from 'src/core/utils/frontmatter/FrontmatterWriter';
import { NoteSummaryFactory } from 'src/core/models/notes/NoteSummaryFactory';

/**
 * --- LLMTagFileProcessor
 * LLM によるノート解析 → タグ正規化 → frontmatter 差分更新 → NoteSummary 生成
 * createdAt, dailynote, taskKey などのフィールドは上書きしない。
 */

export class LLMTagFileProcessor {
  private readonly yamlExtractor: LLMYamlExtractor;
  private readonly frontmatterWriter: FrontmatterWriter;

  constructor(private readonly app: App, private readonly client: LLMClient) {
    this.yamlExtractor = new LLMYamlExtractor();
    this.frontmatterWriter = new FrontmatterWriter(app.vault);
  }

  /**
   * --- process
   * - LLM解析
   * - YAML抽出
   * - タグ正規化
   * - summary / tags のみ frontmatter 差分更新
   * - NoteSummaryFactory で NoteSummary を生成
   * - force = true で再生成強制
   * - force = false で summary/tags が存在するノートはスキップ
   */

  async process(
    file: TFile,
    prompt: string,
    aliases: TagAliases,
    force = false
  ): Promise<NoteSummary> {
    logger.debug(`[LLMTagFileProcessor.process] start file=${file.path}`);

    // --- 既存frontmatter読み込み
    const currentFm = await NoteFrontmatterParser.parseFromFile(this.app, file);

    // --- スキップ判定
    if (!force && NoteFrontmatterParser.isLLMTagGenerated(currentFm)) {
      logger.info(
        `[LLMTagFileProcessor] skip processing (summary/tags exist): ${file.path}`
      );

      return NoteSummaryFactory.createFromMergedFrontmatter(
        this.app,
        file,
        currentFm,
        currentFm.tags ?? [],
        []
      );
    }

    logger.info(`[LLMTagFileProcessor] regenerate enabled: ${file.path}`);

    // --- 1. ファイル読み込み
    const content = await this.app.vault.read(file);

    // --- 2. LLM解析
    const llmText = await this.client.complete(prompt, content);
    if (!llmText) {
      logger.error(`[LLMTagFileProcessor] LLM応答が空 file=${file.path}`);
      throw new Error('LLM応答が空です');
    }

    // --- 3. YAML抽出
    const yamlText = this.yamlExtractor.extract(llmText);
    const parsed = parseYaml(yamlText);
    if (!parsed) {
      logger.error(`[LLMTagFileProcessor] YAML解析失敗 file=${file.path}`);
      throw new Error('YAML解析エラー');
    }

    // --- 4. タグ正規化
    let normalizedTags: string[] = [];
    let newTags: string[] = [];

    if (Array.isArray(parsed.tags)) {
      const { normalized, newTags: diff } =
        aliases.normalizeAndRegisterWithDiff(parsed.tags);

      normalizedTags = normalized;
      newTags = diff;

      logger.debug(
        `[LLMTagFileProcessor.process] normalized=${normalizedTags.length}, new=${newTags.length}`
      );
    }

    // --- 5. 差分更新
    const newData: Record<string, any> = {
      summary: parsed.summary ?? currentFm.summary ?? '(要約なし)',
      tags: normalizedTags,
    };

    await this.frontmatterWriter.update(file, newData);
    logger.info(`[LLMTagFileProcessor] frontmatter updated: ${file.path}`);

    // --- 6. NoteSummaryFactoryへ委譲
    const mergedForSummary = { ...currentFm, ...newData };

    return NoteSummaryFactory.createFromMergedFrontmatter(
      this.app,
      file,
      mergedForSummary,
      normalizedTags,
      newTags
    );
  }
}
