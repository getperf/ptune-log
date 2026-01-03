import { PomodoroInfo } from 'src/core/models/tasks/MyTask/PomodoroInfo';

describe('PomodoroInfo', () => {
  it('toString returns correct format', () => {
    const info = new PomodoroInfo(3, 2);
    expect(info.toString()).toBe('🍅x3 ✅x2');
  });

  it('toString returns only planned if actual is missing', () => {
    const info = new PomodoroInfo(4);
    expect(info.toString()).toBe('🍅x4');
  });

  it('done increments actual count', () => {
    const info = new PomodoroInfo(2);
    info.done();
    expect(info.actual).toBe(1);
    info.done(2);
    expect(info.actual).toBe(3);
  });
});
