const taskService = require('../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create and retrieval', () => {
    test('creates a task with defaults', () => {
      const task = taskService.create({ title: 'Test task' });

      expect(task).toEqual(
        expect.objectContaining({
          title: 'Test task',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: null,
          completedAt: null,
        })
      );
      expect(task.id).toEqual(expect.any(String));
      expect(task.createdAt).toEqual(expect.any(String));
    });

    test('findById returns the task or undefined', () => {
      const task = taskService.create({ title: 'Find me' });

      expect(taskService.findById(task.id)).toEqual(task);
      expect(taskService.findById('missing')).toBeUndefined();
    });

    test('getAll returns a copy of the collection', () => {
      taskService.create({ title: 'One' });
      expect(taskService.getAll()).toHaveLength(1);
    });
  });

  describe('filters and pagination', () => {
    test('filters by exact status', () => {
      taskService.create({ title: 'Todo', status: 'todo' });
      taskService.create({ title: 'Done', status: 'done' });

      expect(taskService.getByStatus('todo')).toHaveLength(1);
      expect(taskService.getByStatus('todo')[0].title).toBe('Todo');
    });

    test('page 1 returns the first page of tasks', () => {
      for (let i = 1; i <= 3; i++) {
        taskService.create({ title: `Task ${i}` });
      }

      expect(taskService.getPaginated(1, 2).map((t) => t.title)).toEqual([
        'Task 1',
        'Task 2',
      ]);
      expect(taskService.getPaginated(2, 2).map((t) => t.title)).toEqual([
        'Task 3',
      ]);
    });
  });

  describe('update and removal', () => {
    test('updates an existing task', () => {
      const task = taskService.create({ title: 'Old' });

      const updated = taskService.update(task.id, { title: 'New' });

      expect(updated.title).toBe('New');
      expect(taskService.findById(task.id).title).toBe('New');
    });

    test('returns null when updating a missing task', () => {
      expect(taskService.update('missing', { title: 'Nope' })).toBeNull();
    });

    test('removes an existing task and returns false for missing task', () => {
      const task = taskService.create({ title: 'Delete me' });

      expect(taskService.remove(task.id)).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
      expect(taskService.remove('missing')).toBe(false);
    });
  });

  describe('completion and assignment', () => {
    test('completes a task without changing its priority', () => {
      const task = taskService.create({ title: 'Important', priority: 'high' });

      const completed = taskService.completeTask(task.id);

      expect(completed.status).toBe('done');
      expect(completed.priority).toBe('high');
      expect(completed.completedAt).toEqual(expect.any(String));
    });

    test('returns null when completing a missing task', () => {
      expect(taskService.completeTask('missing')).toBeNull();
    });

    test('assigns a task', () => {
      const task = taskService.create({ title: 'Assign me' });

      const updated = taskService.assignTask(task.id, 'Gourav');

      expect(updated.assignee).toBe('Gourav');
    });

    test('returns null when assigning a missing task', () => {
      expect(taskService.assignTask('missing', 'Gourav')).toBeNull();
    });
  });

  describe('stats', () => {
    test('counts statuses and overdue tasks', () => {
      taskService.create({
        title: 'Todo',
        status: 'todo',
        dueDate: new Date(Date.now() - 86400000).toISOString(),
      });
      taskService.create({ title: 'Progress', status: 'in_progress' });
      taskService.create({ title: 'Done', status: 'done' });

      expect(taskService.getStats()).toEqual({
        todo: 1,
        in_progress: 1,
        done: 1,
        overdue: 1,
      });
    });
  });
});
