// tests/__mocks__/DummyPlugin.ts
import { Plugin } from 'obsidian';

export class DummyPlugin extends Plugin {
  constructor() {
    // @ts-expect-error Obsidian runtime not available in tests
    super();
  }
}
