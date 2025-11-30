import { App, Plugin, TFile, TFolder } from 'obsidian';
import { LLMTagGenerateExecutor } from './LLMTagGenerateExecutor';
import { LLMPromptPreviewer } from './LLMPromptPreviewer';
import { PromptTemplateManager } from '../../templates/PromptTemplateManager';
import { logger } from 'src/core/services/logger/loggerInstance';

/**
 * --- LLMTagCommandRegistrar
 * LLMタグ生成関連のコマンド登録クラス
 * （ファイルメニュー・日付指定・テンプレート選択・プロンプトプレビュー含む）
 */
export class LLMTagCommandRegistrar {
  private promptManager: PromptTemplateManager;

  constructor(
    private readonly app: App,
    private readonly executor: LLMTagGenerateExecutor
  ) {
    this.promptManager = new PromptTemplateManager(app);
  }

  register(plugin: Plugin) {
    logger.debug('[LLMTagCommandRegistrar.register] start');

    // --- ファイルメニュー登録 ---
    plugin.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem((item) =>
            item
              .setTitle('LLMでタグを自動生成')
              .setIcon('bot')
              .onClick(() => {
                logger.debug(
                  `[LLMTagCommandRegistrar] runOnFile: ${file.path}`
                );
                void this.executor.runOnFile(file);
              })
          );
        } else if (file instanceof TFolder) {
          menu.addItem((item) =>
            item
              .setTitle('LLMでこのフォルダ配下を一括タグ生成')
              .setIcon('bot')
              .onClick(() => {
                logger.debug(
                  `[LLMTagCommandRegistrar] runOnFolder: ${file.path}`
                );
                void this.executor.runOnFolder(file);
              })
          );
        }
      })
    );

    // --- コマンド登録 ---

    // ① 日付指定で今日の振り返り
    plugin.addCommand({
      id: 'llm-tag-generate-by-date',
      name: 'タグ更新: 今日の振り返り（日付指定）',
      callback: () => {
        logger.debug('[LLMTagCommandRegistrar] command: runOnDate');
        void this.executor.runOnDate();
      },
    });

    // ② テンプレート選択
    plugin.addCommand({
      id: 'llm-select-template',
      name: 'タグ更新: LLMタグ生成テンプレートを選択',
      callback: async () => {
        logger.debug('[LLMTagCommandRegistrar] command: select-template');
        this.promptManager.updateTemplate();
      },
    });

    // ③ LLMプロンプトプレビュー
    plugin.addCommand({
      id: 'preview-llm-tag-prompt',
      name: 'LLM Tags: 生成プロンプトをプレビュー表示',
      callback: async () => {
        logger.debug(
          '[LLMTagCommandRegistrar] command: preview-llm-tag-prompt'
        );
        const previewer = new LLMPromptPreviewer(this.app);
        await previewer.showPromptPreview();
      },
    });

    logger.debug('[LLMTagCommandRegistrar.register] complete');
  }
}
