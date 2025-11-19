/** Obsidian Vaultを模倣した最小モック */
export class MockVault {
  adapter = {
    exists: async (_: string) => false,
    readBinary: async (_: string) => new Uint8Array(),
    writeBinary: async (_: string, __: Uint8Array) => {},
  };
}
