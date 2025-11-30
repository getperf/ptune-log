import { App, Plugin } from 'obsidian';
import { LLMSettings } from 'src/config/LLMSettings';
import { LLMPromptService } from 'src/core/services/llm/LLMPromptService';
import { LLMClient } from 'src/core/services/llm/LLMClient';
import { PromptTemplateManager } from './templates/PromptTemplateManager';
import { TagKindRegistry } from 'src/core/models/tags/TagKindRegistry';
import { logger } from 'src/core/services/logger/loggerInstance';

// --- コマンド登録クラス群 ---
import { LLMTagCommandRegistrar } from './services/llm/LLMTagCommandRegistrar';
import { TagCommandRegistrar } from './services/tags/TagCommandRegistrar';
import { VectorCommandRegistrar } from './services/vector/VectorCommandRegistrar';

// --- 実行・処理系 ---
import { LLMTagGenerationRunner } from './services/llm/LLMTagGenerationRunner';
import { LLMTagGenerateExecutor } from './services/llm/LLMTagGenerateExecutor';

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

  constructor(private readonly app: App, settings: LLMSettings) {
    logger.debug('[LLMTagGenerator] initializing');

    // --- コア依存の初期化
    this.llmClient = new LLMClient(app, settings);
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
      this.runner
    );

    // --- コマンド登録層
    this.llmRegistrar = new LLMTagCommandRegistrar(app, this.executor);
    this.tagRegistrar = new TagCommandRegistrar(app, this.llmClient);
    this.vectorRegistrar = new VectorCommandRegistrar(app, this.llmClient);

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

    logger.debug('[LLMTagGenerator.register] complete');
  }
}
