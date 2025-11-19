import { App, PluginSettingTab, Setting } from 'obsidian';
import type PtunePlugin from '../../main';
import type { ConfigManager } from './ConfigManager';
import { renderLLMSettings } from './SettingTabLLM';
import { renderNoteSettings } from './SettingsTabNote';
import { renderSnippetSettings } from './SettingsTabSnippet';
import { renderGoogleAuthSettings } from './SettingsTabGoogleAuth';

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

    containerEl.createEl('h2', { text: 'ptune-log Settings' });

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
          .setValue(this.config.get('logLevel'))
          .onChange(async (value: string) => {
            await this.config.update('logLevel', value as any);
            this.display();
          })
      );
    new Setting(containerEl)
      .setName('Enable log file')
      .setDesc(
        'Write logs to .obsidian/plugins/ptune-log/logs/ptune-log_YYYY-MM-DD.log'
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
