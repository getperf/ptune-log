import { App, TFile, parseYaml } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteSummary } from 'src/core/models/notes/NoteSummary';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { TagAliases } from 'src/core/models/tags/TagAliases';
import { NoteFrontmatterParser } from 'src/core/utils/frontmatter/NoteFrontmatterParser';
import { LLMYamlExtractor } from './LLMYamlExtractor';
import { FrontmatterWriter } from 'src/core/utils/frontmatter/FrontmatterWriter';
import { NoteSummaryFactory } from 'src/core/models/notes/NoteSummaryFactory';

export class LLMTagFileProcessor {
  private readonly yamlExtractor: LLMYamlExtractor;
  private readonly frontmatterWriter: FrontmatterWriter;

  constructor(private readonly app: App, private readonly client: LLMClient) {
    this.yamlExtractor = new LLMYamlExtractor();
    this.frontmatterWriter = new FrontmatterWriter(app.vault);
  }

  /**
   * --- 共通：LLM解析 → YAML抽出 → タグ正規化
   * frontmatter は更新しない
   */
  private async analyzeFile(
    file: TFile,
    prompt: string,
    aliases: TagAliases
  ): Promise<{
    currentFm: any;
    parsed: any;
    normalizedTags: string[];
    newTags: string[];
  }> {
    const currentFm = await NoteFrontmatterParser.parseFromFile(this.app, file);
    const content = await this.app.vault.read(file);

    // --- 1. LLM解析
    const llmText = await this.client.complete(prompt, content);
    if (!llmText) {
      logger.error(`[LLMTagFileProcessor] LLM応答が空 file=${file.path}`);
      throw new Error('LLM応答が空です');
    }

    // --- 2. YAML抽出
    const yamlText = this.yamlExtractor.extract(llmText);
    const parsed = parseYaml(yamlText);
    if (!parsed) {
      logger.error(`[LLMTagFileProcessor] YAML解析失敗 file=${file.path}`);
      throw new Error('YAML解析エラー');
    }

    // --- 3. タグ正規化
    let normalizedTags: string[] = [];
    let newTags: string[] = [];

    if (Array.isArray(parsed.tags)) {
      const { normalized, newTags: diff } =
        aliases.normalizeAndRegisterWithDiff(parsed.tags);

      normalizedTags = normalized;
      newTags = diff;

      logger.debug(
        `[LLMTagFileProcessor] normalized=${normalizedTags.length}, new=${newTags.length}`
      );
    }

    return {
      currentFm,
      parsed,
      normalizedTags,
      newTags,
    };
  }

  /**
   * --- process
   * frontmatter を書き換える
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

    // --- ノート分析
    const { parsed, normalizedTags, newTags } = await this.analyzeFile(
      file,
      prompt,
      aliases
    );

    // --- frontmatter 更新
    const newData = {
      summary: parsed.summary ?? currentFm.summary ?? '(要約なし)',
      tags: normalizedTags,
    };

    await this.frontmatterWriter.update(file, newData);

    // --- マージして NoteSummary 生成
    const mergedForSummary = { ...currentFm, ...newData };
    return NoteSummaryFactory.createFromMergedFrontmatter(
      this.app,
      file,
      mergedForSummary,
      normalizedTags,
      newTags
    );
  }

  /**
   * --- preview
   * frontmatter を更新しない
   */
  async preview(
    file: TFile,
    prompt: string,
    aliases: TagAliases
  ): Promise<NoteSummary> {
    logger.debug(`[LLMTagFileProcessor.preview] start file=${file.path}`);

    const { currentFm, parsed, normalizedTags, newTags } =
      await this.analyzeFile(file, prompt, aliases);

    const mergedForSummary = {
      ...currentFm,
      summary: parsed.summary ?? currentFm.summary ?? '(要約なし)',
      tags: normalizedTags,
    };

    return NoteSummaryFactory.createFromMergedFrontmatter(
      this.app,
      file,
      mergedForSummary,
      normalizedTags,
      newTags
    );
  }
}
