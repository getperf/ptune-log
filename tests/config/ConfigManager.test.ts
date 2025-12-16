// import { ConfigManager, DEFAULT_SETTINGS } from "../../src/config/ConfigManager";
import { DummyPlugin } from '../__mocks__/DummyPlugin';
import { ConfigManager, DEFAULT_SETTINGS } from 'src/config/ConfigManager';

describe('ConfigManager', () => {
  let manager: ConfigManager;

  beforeEach(async () => {
    const plugin = new DummyPlugin();
    manager = new ConfigManager(plugin);
    await manager.load();
  });

  it('should return default userName', () => {
    expect(manager.get('logLevel')).toBe(DEFAULT_SETTINGS.logLevel);
  });

  it('should update userName', async () => {
    await manager.update('logLevel', 'debug');
    expect(manager.get('logLevel')).toBe('debug');
  });
});
