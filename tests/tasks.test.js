const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API', () => {
  beforeEach(() => {
    taskService._reset();
  });

  const createTask = async (overrides = {}) => {
    const response = await request(app)
      .post('/tasks')
      .send({
        title: 'Test task',
        description: 'Description',
        priority: 'high',
        ...overrides,
      });

    expect(response.status).toBe(201);
    return response.body;
  };

  test('GET /tasks returns all tasks', async () => {
    await createTask();
    await createTask({ title: 'Second task' });

    const response = await request(app).get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test('GET /tasks?status filters tasks', async () => {
    await createTask({ status: 'todo' });
    await createTask({ title: 'Done', status: 'done' });

    const response = await request(app).get('/tasks?status=todo');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].status).toBe('todo');
  });

  test('GET /tasks?page=1&limit=2 returns the first page', async () => {
    await createTask({ title: 'First' });
    await createTask({ title: 'Second' });
    await createTask({ title: 'Third' });

    const response = await request(app).get('/tasks?page=1&limit=2');

    expect(response.status).toBe(200);
    expect(response.body.map((task) => task.title)).toEqual(['First', 'Second']);
  });

  test('GET /tasks rejects invalid pagination values', async () => {
    const response = await request(app).get('/tasks?page=0&limit=2');

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/positive integers/i);
  });

  test('POST /tasks creates a task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Write tests', priority: 'high' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Write tests');
    expect(response.body.priority).toBe('high');
    expect(response.body.status).toBe('todo');
  });

  test('POST /tasks validates title', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/title is required/i);
  });

  test('POST /tasks rejects invalid status', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ title: 'Bad status', status: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/status must be one of/i);
  });

  test('PUT /tasks/:id updates a task', async () => {
    const task = await createTask();

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({ title: 'Updated task' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated task');
  });

  test('PUT /tasks/:id returns 404 for a missing task', async () => {
    const response = await request(app)
      .put('/tasks/missing-id')
      .send({ title: 'Updated' });

    expect(response.status).toBe(404);
  });

  test('DELETE /tasks/:id deletes a task', async () => {
    const task = await createTask();

    const response = await request(app).delete(`/tasks/${task.id}`);

    expect(response.status).toBe(204);

    const list = await request(app).get('/tasks');
    expect(list.body).toHaveLength(0);
  });

  test('DELETE /tasks/:id returns 404 for a missing task', async () => {
    const response = await request(app).delete('/tasks/missing-id');

    expect(response.status).toBe(404);
  });

  test('PATCH /tasks/:id/complete completes a task', async () => {
    const task = await createTask({ priority: 'high' });

    const response = await request(app).patch(`/tasks/${task.id}/complete`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('done');
    expect(response.body.priority).toBe('high');
    expect(response.body.completedAt).toEqual(expect.any(String));
  });

  test('PATCH /tasks/:id/complete returns 404 for a missing task', async () => {
    const response = await request(app).patch('/tasks/missing-id/complete');

    expect(response.status).toBe(404);
  });

  test('GET /tasks/stats returns counts and overdue count', async () => {
    await createTask({
      status: 'todo',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    });
    await createTask({ status: 'done' });

    const response = await request(app).get('/tasks/stats');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      todo: 1,
      done: 1,
      overdue: 1,
    });
  });

  test('PATCH /tasks/:id/assign assigns a task', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: ' Gourav ' });

    expect(response.status).toBe(200);
    expect(response.body.assignee).toBe('Gourav');
  });

  test('PATCH /tasks/:id/assign returns 404 for a missing task', async () => {
    const response = await request(app)
      .patch('/tasks/missing-id/assign')
      .send({ assignee: 'Gourav' });

    expect(response.status).toBe(404);
  });

  test('PATCH /tasks/:id/assign rejects an empty assignee', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/assignee is required/i);
  });

  test('PATCH /tasks/:id/assign rejects a non-string assignee', async () => {
    const task = await createTask();

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 123 });

    expect(response.status).toBe(400);
  });

  test('reassigning a task replaces the previous assignee', async () => {
    const task = await createTask();

    await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Alice' });

    const response = await request(app)
      .patch(`/tasks/${task.id}/assign`)
      .send({ assignee: 'Bob' });

    expect(response.status).toBe(200);
    expect(response.body.assignee).toBe('Bob');
  });
});
