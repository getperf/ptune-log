// __mocks__/obsidian.ts
export class App {}

type DataStore = Record<string, unknown>;

export class Plugin {
  app: any = {};
  manifest: any = {};

  // --- in-memory plugin data (per instance) ---
  private _data: DataStore | null = null;

  // Obsidian Plugin API (minimum set used by ConfigManager)
  async loadData(): Promise<DataStore | null> {
    return this._data;
  }

  async saveData(data: DataStore): Promise<void> {
    this._data = data;
  }

  // --- other methods (stubs) ---
  addRibbonIcon() {}
  addStatusBarItem() {}
  registerEvent() {}
  registerDomEvent() {}
  registerInterval() {}
}

export class Modal {
  constructor(public app: App) {}
}
export class Notice {
  constructor(message: string) {
    console.log('Notice:', message);
  }
}

export class Setting {
  constructor(containerEl: HTMLElement) {}
  setName(name: string) {
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  addText(cb: Function) {
    cb({
      setPlaceholder: () => {},
      onChange: () => {},
      inputEl: document.createElement('input'),
    });
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/ban-types
  addButton(cb: Function) {
    cb({
      setButtonText: () => {},
      setCta: () => {},
      onClick: () => {},
    });
    return this;
  }
}

export class TFolder {
  path = '';
}

export class TFile {
  // name = "mocked-file.md";
  path = '';
  get name(): string {
    return this.path.split('/').pop() ?? '';
  }
}

export class Vault {
  private files: Record<string, TFile | TFolder> = {};

  getAbstractFileByPath(path: string): TFile | TFolder | null {
    return this.files[path] ?? null;
  }

  async create(path: string, content: string): Promise<TFile> {
    const file = new TFile();
    file.path = path;
    this.files[path] = file;
    return file;
  }

  async createFolder(path: string): Promise<TFolder> {
    const folder = new TFolder();
    folder.path = path;
    this.files[path] = folder;
    return folder;
  }
}

export function normalizePath(path: string): string {
  return path.replace(/\/+/g, '/');
}

export class Menu {}
export class MenuItem {
  setTitle(_: string) {
    return this;
  }
  setIcon(_: string) {
    return this;
  }
  onClick(_: () => void) {
    return this;
  }
}

export class Workspace {
  // eslint-disable-next-line @typescript-eslint/ban-types
  on(_: string, __: Function) {
    return 'event-ref';
  }

  getLeaf(): any {
    return {
      openFile: async (file: TFile) => {
        console.log('Opening file:', file.name);
      },
    };
  }
}
