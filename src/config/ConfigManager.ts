import { Plugin } from 'obsidian';
import { LogLevel } from 'src/core/services/logger/Logger';
import { LLMSettings } from './settings/LLMSettings';
import { PROJECT_NOTE_TEMPLATE } from 'src/core/templates/project_note_template';
import { SerialNoteCreationType } from 'src/features/note_creator/modals/NoteCreatorModal';
import {
  DEFAULT_REVIEW_SETTINGS,
  ReviewSettings,
} from './settings/ReviewSettings';

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
  filename: string;
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
  review: ReviewSettings;
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
    minSimilarityScore: 0.5,
    enableChecklist: true,

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
  review: DEFAULT_REVIEW_SETTINGS,
};

export class ConfigManager {
  private plugin: Plugin;
  settings: PluginSettings;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.settings = DEFAULT_SETTINGS;
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
      review: {
        ...DEFAULT_REVIEW_SETTINGS,
        ...(loaded?.review ?? {}),
      },
    };
  }

  async save(): Promise<void> {
    await this.plugin.saveData(this.settings);
  }

  /** -------------------------------
   * 型安全な設定取得
   * ------------------------------- */
  get<T>(key: string): T {
    const parts = key.split('.');

    let current: unknown = this.settings;

    for (const p of parts) {
      if (typeof current === 'object' && current !== null && p in current) {
        current = (current as Record<string, unknown>)[p];
      } else {
        return undefined as unknown as T;
      }
    }

    return current as T;
  }

  /** -------------------------------
   * 型安全な階層更新
   * ------------------------------- */
  async update<T>(key: string, value: T): Promise<void> {
    const parts = key.split('.');
    let current: unknown = this.settings;

    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];

      if (typeof current === 'object' && current !== null && p in current) {
        current = (current as Record<string, unknown>)[p];
      } else {
        // 作成して進む
        (current as Record<string, unknown>)[p] = {};
        current = (current as Record<string, unknown>)[p];
      }
    }

    const lastKey = parts[parts.length - 1];
    if (typeof current === 'object' && current !== null) {
      (current as Record<string, unknown>)[lastKey] = value;
    }

    await this.save();
  }

  getPrefixType(creationType: SerialNoteCreationType): notePrefixType {
    switch (creationType) {
      case SerialNoteCreationType.FILE:
        return this.get<notePrefixType>('note.notePrefix');
      case SerialNoteCreationType.FOLDER:
        return this.get<notePrefixType>('note.folderPrefix');
      default:
        return notePrefixType.SERIAL;
    }
  }
}
