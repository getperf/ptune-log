import { App, Plugin } from 'obsidian';
import { LLMSettings } from 'src/config/settings/LLMSettings';
import { PromptTemplateManager } from '../../../core/services/prompts/PromptTemplateManager';
import { TagKindRegistry } from 'src/core/models/tags/TagKindRegistry';
import { logger } from 'src/core/services/logger/loggerInstance';

// --- コマンド登録クラス群 ---
import { LLMTagCommandRegistrar } from '../commands/LLMTagCommandRegistrar';
import { VectorCommandRegistrar } from '../../vectors/commands/VectorCommandRegistrar';

// --- 実行・処理系 ---
import { LLMTagGenerationRunner } from '../../../core/services/llm/workflow/LLMTagGenerationRunner';
import { LLMTagGenerateExecutor } from '../../../core/services/llm/workflow/LLMTagGenerateExecutor';
import { ReviewSettings } from 'src/config/settings/ReviewSettings';
import { NoteReviewCommandRegistrar } from '../../note_review/commands/NoteReviewCommandRegistrar';
import { TagCommandRegistrar } from '../../tags/commands/TagCommandRegistrar';
import { LLMClient } from 'src/core/services/llm/client/LLMClient';
import { LLMPromptService } from 'src/core/services/llm/client/LLMPromptService';

/**
 * --- LLMタグ生成のエントリーポイント
 * 初期化・テンプレート準備・コマンド登録を統括
 */
export class LLMTagGenerator {
  private llmClient: LLMClient;
  private promptService: LLMPromptService;
  private promptManager: PromptTemplateManager;
  private runner: LLMTagGenerationRunner;
  private executor: LLMTagGenerateExecutor;

  private llmRegistrar: LLMTagCommandRegistrar;
  private tagRegistrar: TagCommandRegistrar;
  private vectorRegistrar: VectorCommandRegistrar;
  private reviewRegistrar: NoteReviewCommandRegistrar;

  constructor(
    private readonly app: App,
    llmSettings: LLMSettings,
    reviewSettings: ReviewSettings
  ) {
    logger.debug('[LLMTagGenerator] initializing');

    // --- コア依存の初期化
    this.llmClient = new LLMClient(app, llmSettings);
    this.promptService = new LLMPromptService(app.vault);
    this.promptManager = new PromptTemplateManager(app);

    // --- 解析・実行層
    this.runner = new LLMTagGenerationRunner(
      app,
      this.llmClient,
      this.promptService
    );
    this.executor = new LLMTagGenerateExecutor(
      app,
      this.llmClient,
      this.runner,
      reviewSettings
    );

    // --- コマンド登録層
    this.llmRegistrar = new LLMTagCommandRegistrar(app, this.executor);
    this.tagRegistrar = new TagCommandRegistrar(app, this.llmClient);
    this.vectorRegistrar = new VectorCommandRegistrar(app, this.llmClient);
    this.reviewRegistrar = new NoteReviewCommandRegistrar(app, this.llmClient);

    logger.debug('[LLMTagGenerator] initialized successfully');
  }

  /**
   * --- コマンドやイベントの登録を行う
   */
  async register(plugin: Plugin): Promise<void> {
    logger.debug('[LLMTagGenerator.register] start');

    // --- テンプレートとレジストリ初期化
    await this.promptManager.initializeTemplate();
    const registry = TagKindRegistry.getInstance(plugin.app.vault);
    await registry.ensure();

    // --- コマンド登録を各領域に分離
    this.llmRegistrar.register(plugin);
    this.tagRegistrar.register(plugin);
    this.vectorRegistrar.register(plugin);
    this.reviewRegistrar.register(plugin);

    logger.debug('[LLMTagGenerator.register] complete');
  }
}
