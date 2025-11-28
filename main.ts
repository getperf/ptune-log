import { Notice, Plugin } from 'obsidian';
import { ConfigManager } from './src/config/ConfigManager';
import { PtuneSettingTab } from './src/config/SettingsTab';
import { LayoutRelocator } from 'src/app/LayoutRelocator';
import { PomodoroSuggest } from 'src/app/PomodoroSuggest';
import { GoogleTasksFeature } from 'src/features/google_tasks/GoogleTasksFeature';
import { LLMTagGenerator } from 'src/features/llm_tags/LLMTagGenerator';
import { TagContextMenuHandler } from 'src/features/tag_wrangler/TagContextMenuHandler';
import { logger } from 'src/core/services/logger/loggerInstance';
import { NoteCreator } from 'src/features/note_creator/commands/NoteCreator';
import { OutlineUpdator } from 'src/features/outline_updator/OutlineUpdator';
import { InitialSetupManager } from 'src/features/setup/InitialSetupManager';
import { NoteSetupHelper } from 'src/features/setup/NoteSetupHelper';

export default class PtunePlugin extends Plugin {
  private config!: ConfigManager;
  private noteCreator!: NoteCreator;
  private suggest!: PomodoroSuggest;
  private llmTagGenerator!: LLMTagGenerator;
  private googleTasks!: GoogleTasksFeature;
  private requiredPluginChecker!: InitialSetupManager;
  private noteSetupHelper!: NoteSetupHelper;
  private update!: OutlineUpdator;
  private tagUtilsHandler!: TagContextMenuHandler;

  async onload() {
    // --- 設定ロード ---
    this.config = new ConfigManager(this);
    await this.config.load();

    // --- ロガー設定 ---
    await logger.initFileOutput(
      this.app.vault,
      this.config.get('enableLogFile')
    );
    logger.setLevel(this.config.get('logLevel'));
    logger.info('ptune-log plugin loading...');

    // --- 初期セットアップ ---
    this.noteSetupHelper = new NoteSetupHelper(this.app);
    await this.noteSetupHelper.ensureResources();

    // --- LLMタギング ---
    this.llmTagGenerator = new LLMTagGenerator(
      this.app,
      this.config.settings.llm
    );

    // --- Google Tasks ---
    this.googleTasks = new GoogleTasksFeature(
      this,
      this.config.settings.google_auth
    );
    this.googleTasks.regist();

    // --- ノート生成 ---
    this.noteCreator = new NoteCreator(this.app, this.config);
    this.registerEvent(this.noteCreator.registerFileMenuCallback());

    // --- エディタ補完 ---
    this.registerEditorSuggest(new PomodoroSuggest(this.app));

    this.requiredPluginChecker = new InitialSetupManager(
      this.app,
      this.noteSetupHelper
    );
    this.requiredPluginChecker.register(this);

    // --- アウトライン更新 ---
    this.update = new OutlineUpdator(this);
    this.update.regist();

    // --- Tag Context Menu ---
    this.tagUtilsHandler = new TagContextMenuHandler(
      this,
      this.config.settings.llm
    );
    this.tagUtilsHandler.register();

    // --- レイアウト準備後処理 ---
    this.app.workspace.onLayoutReady(async () => {
      const relocator = new LayoutRelocator(this.app);
      await relocator.ensureDefaultViewsInLeftPane();
      await this.requiredPluginChecker.checkAll();
      await this.llmTagGenerator.register(this);
    });

    // --- リボンアイコン ---
    const ribbonIconEl = this.addRibbonIcon(
      'dice',
      'Sample Plugin',
      async () => new Notice('This is a notice!')
    );
    ribbonIconEl.addClass('my-plugin-ribbon-class');

    // --- 設定タブ登録（A案）---
    // ① 全体設定タブ（従来と同じ）
    this.addSettingTab(new PtuneSettingTab(this.app, this, this.config));
  }

  onunload() {
    this.suggest?.close();
  }
}
