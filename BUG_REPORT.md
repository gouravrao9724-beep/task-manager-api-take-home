# Bug Report

## Bug 1 — Pagination skips the first page

**Location:** `src/services/taskService.js`, `getPaginated()`.

**Expected behavior:**  
For `page=1&limit=2`, the API should return the first two tasks.

**Actual behavior:**  
The original implementation calculated `offset = page * limit`, so page 1 started at index 2 and skipped the first two tasks.

**How testing discovered it:**  
A service test created three tasks and asserted that page 1 contains the first two tasks. The original implementation failed this expectation.

**Fix:**  
Changed the offset calculation to `(page - 1) * limit`.

---

## Bug 2 — Status filtering uses substring matching

**Location:** `src/services/taskService.js`, `getByStatus()`.

**Expected behavior:**  
A status filter should return tasks whose status exactly matches the requested status.

**Actual behavior:**  
The original code used `t.status.includes(status)`. This could return unrelated statuses for partial values.

**How testing discovered it:**  
A unit test checks exact status matching.

**Fix recommendation:**  
Use strict equality (`t.status === status`). This was included in the submitted implementation.

---

## Bug 3 — Completing a task changes its priority

**Location:** `src/services/taskService.js`, `completeTask()`.

**Expected behavior:**  
Completing a task should change its status and completion timestamp while preserving unrelated task properties such as priority.

**Actual behavior:**  
The original implementation always changed `priority` to `medium`.

**How testing discovered it:**  
A test creates a high-priority task, completes it, and verifies that its priority remains `high`.

**Fix:**  
Removed the forced `priority: 'medium'` assignment.

---

## Notes

The fixes above are intentionally small and localized. The goal is to correct observed behavior without redesigning the existing API.
