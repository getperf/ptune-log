import { MyTask } from 'src/core/models/tasks/MyTask';
import { PomodoroInfo } from 'src/core/models/tasks/MyTask/PomodoroInfo';

describe('MyTask', () => {
  it('toString includes status and pomodoro', () => {
    const task = new MyTask(
      '1',
      'Test Task',
      undefined,
      undefined,
      undefined,
      undefined,
      new PomodoroInfo(2, 1),
      'completed'
    );
    expect(task.toString()).toBe('[x] Test Task 🍅x2 ✅x1');
  });

  it('toApiData converts to expected format', () => {
    const task = new MyTask(
      '1',
      'Title',
      undefined,
      'note',
      undefined,
      undefined,
      new PomodoroInfo(2),
      'needsAction'
    );
    const data = task.toApiData();
    expect(data.title).toBe('Title');
    expect(data.notes).toContain('🍅x2');
    expect(data.status).toBe('needsAction');
  });

  it('toString includes time range when started and completed are set', () => {
    const started = '2025-07-27T09:47:49.000Z';
    const completed = '2025-07-27T09:48:16.000Z';
    const task = new MyTask(
      '2',
      'Time Task',
      undefined,
      undefined,
      undefined,
      undefined,
      new PomodoroInfo(1),
      'completed',
      undefined,
      undefined,
      completed,
      undefined,
      started
    );
    const str = task.toString();
    expect(str).toMatch(
      /\[x\] Time Task 🍅x1 \d{1,2}:\d{2}:\d{2} - \d{1,2}:\d{2}:\d{2}/
    );
  });

  it('toString includes only started time when completed is missing', () => {
    const started = '2025-07-27T09:47:49.000Z';
    const task = new MyTask(
      '3',
      'Partial Time Task',
      undefined,
      undefined,
      undefined,
      undefined,
      new PomodoroInfo(1),
      'needsAction',
      undefined,
      undefined,
      undefined,
      undefined,
      started
    );
    const str = task.toString();
    expect(str).toMatch(/\[ \] Partial Time Task 🍅x1 \d{1,2}:\d{2}:\d{2}?/);
  });

  it('toString omits time when neither started nor completed is set', () => {
    const task = new MyTask(
      '4',
      'No Time Task',
      undefined,
      undefined,
      undefined,
      undefined,
      new PomodoroInfo(1),
      'needsAction'
    );
    const str = task.toString();
    expect(str).toBe('[ ] No Time Task 🍅x1');
  });

  it('should show correct JST time range with started and completed', () => {
    const task = new MyTask(
      '1',
      'リグレッション',
      undefined,
      undefined,
      undefined,
      undefined,
      new PomodoroInfo(1),
      'completed',
      [],
      undefined,
      '2025-07-27T00:48:16Z',
      undefined,
      '2025-07-27T00:47:49Z',
      false
    );
    const result = task.toString();
    console.log('DEBUG:', result);
    expect(result).toBe('[x] リグレッション 🍅x1 9:47:49 - 9:48:16');
  });
});
