import { App, PluginSettingTab, Setting } from 'obsidian';
import type PtunePlugin from '../../main';
import type { ConfigManager } from './ConfigManager';
import { renderLLMSettings } from './SettingTabLLM';
import { renderNoteSettings } from './SettingsTabNote';
import { renderSnippetSettings } from './SettingsTabSnippet';
import { renderGoogleAuthSettings } from './SettingsTabGoogleAuth';
import type { LogLevel } from 'src/core/services/logger/Logger';

function isLogLevel(v: string): v is LogLevel {
  return ['debug', 'info', 'warn', 'error', 'none'].includes(v);
}

export class PtuneSettingTab extends PluginSettingTab {
  private plugin: PtunePlugin;
  private config: ConfigManager;

  constructor(app: App, plugin: PtunePlugin, config: ConfigManager) {
    super(app, plugin);
    this.plugin = plugin;
    this.config = config;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("基本設定").setHeading();
    new Setting(containerEl)
      .setName('Log level')
      .setDesc('Set the logging verbosity')
      .addDropdown((dropdown) =>
        dropdown
          .addOptions({
            debug: 'Debug',
            info: 'Info',
            warn: 'Warn',
            error: 'Error',
            none: 'None',
          })
          .setValue(this.config.get<LogLevel>('logLevel'))
          .onChange(async (value: string) => {
            // 型ガードで LogLevel に narrow
            if (isLogLevel(value)) {
              await this.config.update<LogLevel>('logLevel', value);
            }
            this.display();
          })
      );
    new Setting(containerEl)
      .setName('Enable log file')
      .setDesc(
        'Write logs to {vault config}/plugins/ptune-log/logs/ptune-log_YYYY-MM-DD.log'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.config.get('enableLogFile'))
          .onChange(async (value) => {
            await this.config.update('enableLogFile', value);
            this.display();
          })
      );
    renderNoteSettings(containerEl, this.config, this.config.settings);
    renderSnippetSettings(containerEl, this.config, this.config.settings);
    renderLLMSettings(containerEl, this.config, this.config.settings, this);
    renderGoogleAuthSettings(containerEl, this.config, this.config.settings);
  }
}
