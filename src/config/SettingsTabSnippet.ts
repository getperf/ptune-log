import { Setting } from 'obsidian';
import type { ConfigManager, PluginSettings } from './ConfigManager';

export function renderSnippetSettings(
  containerEl: HTMLElement,
  config: ConfigManager,
  settings: PluginSettings
) {
  new Setting(containerEl)
    .setName('Snippet filename')
    .setDesc('File name to save snippets (default: snippet.md)')
    .addText((text) =>
      text
        .setPlaceholder('snippet.md')
        .setValue(settings.snippet.filename)
        .onChange(async (value) => {
          await config.update('snippet.filename', value.trim() || 'snippet.md');
        })
    );
}
