import { App, Plugin } from 'obsidian';
import { logger } from 'src/core/services/logger/loggerInstance';

import { LLMSettings } from 'src/config/settings/LLMSettings';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';

// --- コマンド登録 ---
import { LLMTagCommandRegistrar } from '../commands/LLMTagCommandRegistrar';
import { VectorCommandRegistrar } from '../../vectors/commands/VectorCommandRegistrar';
import { NoteReviewCommandRegistrar } from '../../note_review/commands/NoteReviewCommandRegistrar';
import { TagCommandRegistrar } from '../../tags/commands/TagCommandRegistrar';

// --- core services ---
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { PromptTemplateService } from 'src/core/services/llm/client/PromptTemplateService';
import { TagKindRegistry } from 'src/core/models/tags/TagKindRegistry';
import { TagYamlIO } from 'src/core/services/yaml/TagYamlIO';
import { TagRankCalculator } from 'src/core/services/tags/TagRankCalculator';

import { NoteAnalysisPromptBuilder } from 'src/core/services/llm/note_analysis/NoteAnalysisPromptBuilder';
import { NoteAnalysisRunner } from 'src/core/services/llm/note_analysis/NoteAnalysisRunner';

// --- feature usecase ---
import { NoteAnalysisUpdateUseCase } from '../application/NoteAnalysisUpdateUseCase';

/**
 * --- LLM タグ／分析機能のエントリーポイント
 * core service を組み立て、UseCase と Command を接続する
 */
export class LLMTagGenerator {
  private readonly llmClient: LLMClient;
  private readonly runner: NoteAnalysisRunner;
  private readonly executor: NoteAnalysisUpdateUseCase;

  private readonly llmRegistrar: LLMTagCommandRegistrar;
  private readonly tagRegistrar: TagCommandRegistrar;
  private readonly vectorRegistrar: VectorCommandRegistrar;
  private readonly reviewRegistrar: NoteReviewCommandRegistrar;

  constructor(
    private readonly app: App,
    llmSettings: LLMSettings,
    reviewSettings: ReviewSettings
  ) {
    logger.debug('[LLMTagGenerator] initializing');

    // --- LLM クライアント
    this.llmClient = new LLMClient(app, llmSettings);

    // --- TagRank 計算系（core）
    const tagRegistry = TagKindRegistry.getInstance(app.vault);
    const tagYamlIO = new TagYamlIO();
    const tagRankCalculator = new TagRankCalculator(
      tagRegistry,
      tagYamlIO
    );

    // --- Prompt 系（core）
    const templateService = new PromptTemplateService(app.vault);
    const promptBuilder = new NoteAnalysisPromptBuilder(templateService);

    // --- 分析処理（core）
    // const processor = new NoteAnalysisProcessor(app, this.llmClient);

    this.runner = new NoteAnalysisRunner(
      app,
      this.llmClient,
      promptBuilder,
      tagRankCalculator
    );

    // --- UseCase（feature）
    this.executor = new NoteAnalysisUpdateUseCase(
      app,
      this.llmClient,
      this.runner,
      reviewSettings
    );

    // --- コマンド登録
    this.llmRegistrar = new LLMTagCommandRegistrar(app, this.executor);
    this.tagRegistrar = new TagCommandRegistrar(app, this.llmClient);
    this.vectorRegistrar = new VectorCommandRegistrar(app, this.llmClient);
    this.reviewRegistrar = new NoteReviewCommandRegistrar(app, this.llmClient);

    logger.debug('[LLMTagGenerator] initialized successfully');
  }

  /**
   * --- コマンド登録
   */
  async register(plugin: Plugin): Promise<void> {
    logger.debug('[LLMTagGenerator.register] start');

    // TagKindRegistry 初期化
    const registry = TagKindRegistry.getInstance(plugin.app.vault);
    await registry.ensure();

    this.llmRegistrar.register(plugin);
    this.tagRegistrar.register(plugin);
    this.vectorRegistrar.register(plugin);
    this.reviewRegistrar.register(plugin);

    logger.debug('[LLMTagGenerator.register] complete');
  }
}
