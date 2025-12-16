import { MyTask } from 'src/core/models/tasks/MyTask';
import { PomodoroInfo } from 'src/core/models/tasks/MyTask/PomodoroInfo';
import { MyTaskFactory } from 'src/core/models/tasks/MyTaskFactory';
import { GoogleTaskDto } from 'src/core/models/tasks/GoogleTaskDto';

describe('TaskFactory', () => {
  it('should parse API data into MyTask', () => {
    const apiTask: GoogleTaskDto = {
      id: '123',
      title: 'Test Task',
      note: 'Note 🍅x2 ✅x1',
      status: 'needsAction',
      due: '2024-06-13T10:00:00.000Z',
    };

    const task = MyTaskFactory.fromApiData(apiTask, 'todayList');

    expect(task.id).toBe('123');
    expect(task.title).toBe('Test Task');
    expect(task.tasklist_id).toBe('todayList');
    expect(task.note).toBe('Note');
    expect(task.pomodoro?.planned).toBe(2);
    expect(task.pomodoro?.actual).toBe(1);
    expect(task.due).toBe('2024-06-13T10:00:00.000Z');
  });

  it('returns undefined pomodoro if 🍅 is missing', () => {
    const apiData: GoogleTaskDto = {
      id: '1',
      title: 'No Tomato',
      note: 'just a note',
      status: 'needsAction',
    };

    const task = MyTaskFactory.fromApiData(apiData, 'today');
    expect(task.pomodoro?.planned).toBe(0);
    expect(task.pomodoro?.actual).toBeUndefined();
  });

  it('returns valid PomodoroInfo if 🍅x3 is present', () => {
    const apiData: GoogleTaskDto = {
      id: '3',
      title: 'Valid Pomodoro',
      note: 'task 🍅x3 ✅x2',
      status: 'needsAction',
    };

    const task = MyTaskFactory.fromApiData(apiData, 'today');
    expect(task.pomodoro).toBeDefined();
    expect(task.pomodoro?.planned).toBe(3);
    expect(task.pomodoro?.actual).toBe(2);
  });

  it('should copy task data except ID', () => {
    const source = new MyTask('abc', 'Source Task');
    source.note = 'Test';
    source.pomodoro = new PomodoroInfo(3, 1);

    const target = new MyTask('xyz', 'Target Task');
    MyTaskFactory.copyTaskData(source, target);

    expect(target.id).toBe('xyz');
    expect(target.note).toBe('Test');
    expect(target.pomodoro?.planned).toBe(3);
    expect(target.pomodoro?.actual).toBe(1);
  });

  it('parses started and completed timestamps from note', () => {
    const note =
      '🍅x1 ✅x1 started=2025-07-27T09:47:49.902210 completed=2025-07-27T09:48:16.564339';

    const taskData: GoogleTaskDto = {
      id: '123',
      title: 'Test Task',
      note,
      updated: '2025-07-27T09:50:00.000Z',
      status: 'completed',
    };

    const task: MyTask = MyTaskFactory.fromApiData(taskData, 'list-1');

    expect(task.started).toBe('2025-07-27T09:47:49.902210');
    expect(task.completed).toBe('2025-07-27T09:48:16.564339');
    expect(task.note).toBeUndefined(); // ノート本体は空
    expect(task.pomodoro?.planned).toBe(1);
    expect(task.pomodoro?.actual).toBe(1);
  });

  it('parses only started when completed is missing', () => {
    const note = '🍅x2 started=2025-07-27T09:00:00.000Z';

    const taskData: GoogleTaskDto = {
      id: '456',
      title: 'Started Only',
      note,
      status: 'needsAction',
    };

    const task = MyTaskFactory.fromApiData(taskData);
    expect(task.started).toBe('2025-07-27T09:00:00.000Z');
    expect(task.completed).toBeUndefined();
  });

  it('parses completed from task.completed if not in note', () => {
    const taskData: GoogleTaskDto = {
      id: '789',
      title: 'API Completed',
      note: '🍅x1',
      status: 'completed',
      completed: '2025-07-27T10:00:00.000Z',
    };

    const task = MyTaskFactory.fromApiData(taskData);
    expect(task.completed).toBe('2025-07-27T10:00:00.000Z');
  });

  it('removes started/completed from note body', () => {
    const taskData: GoogleTaskDto = {
      id: '999',
      title: 'Cleanup Note',
      note: 'memo 🍅x1 started=2025-07-27T00:47:49.902210 completed=2025-07-27T00:48:16.564339',
      status: 'completed',
    };

    const task = MyTaskFactory.fromApiData(taskData);
    expect(task.note).toBe('memo');
  });
});
