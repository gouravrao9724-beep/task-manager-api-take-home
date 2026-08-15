# Task Manager API — Take-Home Assignment

A small Express Task Manager API with unit tests, integration tests, bug fixes, and task assignment functionality.

## Stack

- Node.js
- Express
- Jest
- Supertest
- UUID
- In-memory data store

## Setup

```bash
cd task-api
npm install
npm start
```

The API runs on:

```text
http://localhost:3000
```

## Run tests

```bash
npm test
```

## Coverage

```bash
npm run coverage
```

The test suite contains:

- Unit tests for `taskService.js`
- Integration tests for all API endpoints
- Validation/error cases
- Pagination behavior
- Completion behavior
- Statistics
- Task assignment behavior

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List tasks |
| GET | `/tasks?status=todo` | Filter by status |
| GET | `/tasks?page=1&limit=10` | Paginated tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH | `/tasks/:id/complete` | Complete task |
| GET | `/tasks/stats` | Task statistics |
| PATCH | `/tasks/:id/assign` | Assign/reassign task |

## Assignment endpoint

### Request

```http
PATCH /tasks/:id/assign
Content-Type: application/json
```

```json
{
  "assignee": "Gourav"
}
```

### Behavior

- `assignee` must be a non-empty string.
- Whitespace around the name is trimmed.
- Missing tasks return `404`.
- Reassigning a task replaces the previous assignee. This was chosen because reassignment is a normal task-management operation and keeps the endpoint idempotent for the same value.

## Bug fixes

See [`BUG_REPORT.md`](./BUG_REPORT.md) for the bugs found, how the tests exposed them, and the fixes.

## What I would test next

With more time I would add:

- More validation tests for malformed dates and unexpected fields
- Tests for large pagination values
- Tests for concurrent updates
- API-level schema validation
- Error-handling middleware tests
- Automated CI coverage checks

## Questions before production

Before shipping, I would clarify:

1. Should assignees be validated against a user directory?
2. Should reassignment require a separate permission?
3. Should task history record who changed the assignee?
4. Should pagination return metadata such as total count and total pages?
5. What should happen when an already completed task is completed again?

## Surprises

The main behavior issues were small but meaningful: pagination used a zero-based offset with a one-based API parameter, status filtering used substring matching, and completing a task unexpectedly changed its priority. These are exactly the kinds of regressions that focused behavior tests can catch.
