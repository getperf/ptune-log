import { Logger, LogLevel } from 'src/core/services/logger/Logger';
import { LLMSettings } from './LLMSettings';
import { PROJECT_NOTE_TEMPLATE } from 'src/core/templates/project_note_template';
import { SerialNoteCreationType } from 'src/features/note_creator/modals/NoteCreatorModal';

export enum notePrefixType {
  SERIAL = 'serial',
  DATE = 'date',
}

export interface NoteSettings {
  folderPrefix: notePrefixType;
  notePrefix: notePrefixType;
  prefixDigits: number;
  templateText: string;
}

export interface SnippetSettings {
  filename: string; // e.g. "snippet.md"
}

export interface GoogleAuthSettings {
  clientId: string;
  clientSecret: string;
  useWinApp: boolean;
}

export interface PluginSettings {
  logLevel: LogLevel;
  enableLogFile: boolean;
  note: NoteSettings;
  snippet: SnippetSettings;
  llm: LLMSettings;
  google_auth: GoogleAuthSettings;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  logLevel: 'info',
  enableLogFile: false,
  note: {
    folderPrefix: notePrefixType.SERIAL,
    notePrefix: notePrefixType.SERIAL,
    prefixDigits: 2,
    templateText: PROJECT_NOTE_TEMPLATE,
  },
  snippet: {
    filename: 'snippet.md', // デフォルトファイル名
  },
  llm: {
    provider: 'OpenAI Chat',
    apiKey: '',
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    baseUrl: 'https://api.openai.com/v1',
    temperature: 0.2,
    maxTokens: 1024,
    minSimilarityScore: 0.2,

    // provider: "Gemini AI Chat",
    // apiKey: "",
    // baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    // model: "gemini-2.5-flash",
    // temperature: 0.5,
    // maxTokens: 1024
  },
  google_auth: {
    clientId: '',
    clientSecret: '',
    useWinApp: true,
  },
};

export class ConfigManager {
  private plugin: any;
  private saveCallback: () => Promise<void>;
  private logger: Logger;
  settings: PluginSettings = DEFAULT_SETTINGS;

  constructor(plugin: any) {
    this.plugin = plugin;
  }

  async load(): Promise<void> {
    const loaded = await this.plugin.loadData();

    this.settings = {
      ...DEFAULT_SETTINGS,
      ...loaded,
      note: {
        ...DEFAULT_SETTINGS.note,
        ...(loaded?.note ?? {}),
      },
      snippet: {
        ...DEFAULT_SETTINGS.snippet,
        ...(loaded?.snippet ?? {}),
      },
      llm: {
        ...DEFAULT_SETTINGS.llm,
        ...(loaded?.llm ?? {}),
      },
      google_auth: {
        ...DEFAULT_SETTINGS.google_auth,
        ...(loaded?.google_auth ?? {}),
      },
    };
  }

  async save(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  getPrefixType(creationType: SerialNoteCreationType): notePrefixType {
    switch (creationType) {
      case SerialNoteCreationType.FILE:
        return this.get('note.notePrefix');
      case SerialNoteCreationType.FOLDER:
        return this.get('note.folderPrefix');
      default:
        return notePrefixType.SERIAL;
    }
  }

  // get<K extends keyof PluginSettings>(key: K): PluginSettings[K] {
  //     return this.settings[key];
  // }
  get<T = unknown>(key: string): T {
    return key
      .split('.')
      .reduce((obj: any, prop: string) => obj?.[prop], this.settings);
  }

  async update(key: string, value: any): Promise<void> {
    const keys = key.split('.');
    let obj: any = this.settings;

    for (let i = 0; i < keys.length - 1; i++) {
      const part = keys[i];
      if (!(part in obj)) {
        obj[part] = {}; // 必要なら途中オブジェクトを作成
      }
      obj = obj[part];
    }

    obj[keys[keys.length - 1]] = value;
    await this.save();
  }
}
