// import { ConfigManager, DEFAULT_SETTINGS } from "../../src/config/ConfigManager";

import { ConfigManager, DEFAULT_SETTINGS } from "src/config/ConfigManager";

class DummyPlugin {
    private data: any = {};
    async loadData() {
        return this.data;
    }
    async saveData(data: any) {
        this.data = data;
    }
}

describe("ConfigManager", () => {
    let manager: ConfigManager;

    beforeEach(async () => {
        const plugin = new DummyPlugin();
        manager = new ConfigManager(plugin);
        await manager.load();
    });

    it("should return default userName", () => {
        expect(manager.get("logLevel")).toBe(DEFAULT_SETTINGS.logLevel);
    });

    it("should update userName", async () => {
        await manager.update("logLevel", "debug");
        expect(manager.get("logLevel")).toBe("debug");
    });
});
