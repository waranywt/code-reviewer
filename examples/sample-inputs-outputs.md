# Sample Agent Inputs & Outputs

These examples show how the Code Review Assistant analyses submitted code.
Each example includes the raw input and the structured JSON the agent returns
(before the UI renders it).

---

## Example 1 — Multiple Issues (JS fetch without error handling)

**Input:**
```js
function fetchUser(id) {
  return fetch('/api/users/' + id).then(r => r.json());
}
```

**Agent output (analysis step):**
```json
{
  "issues": [
    {
      "severity": "critical",
      "category": "error-handling",
      "message": "fetch() call has no error handling — network failures or non-2xx responses will silently produce garbage data.",
      "suggestion": "Check res.ok before calling .json(), and wrap the whole call in a try/catch."
    },
    {
      "severity": "warning",
      "category": "code-style",
      "message": "Uses the legacy .then() Promise chain instead of async/await.",
      "suggestion": "Rewrite with async/await for readability and easier error propagation."
    },
    {
      "severity": "warning",
      "category": "security",
      "message": "String concatenation for the URL path can introduce path-traversal issues if `id` is user-supplied.",
      "suggestion": "Use a template literal and validate/sanitise the id before interpolation."
    }
  ],
  "summary": "This function fetches a user but provides no error handling and uses an outdated promise style. It could silently fail in production."
}
```

**Corrected code (correction step):**
```js
async function fetchUser(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid user id');
  }
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(id)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('fetchUser error:', err);
    throw err;
  }
}
```

---

## Example 2 — Security Issue (SQL injection)

**Input:**
```python
def get_user(conn, username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return conn.execute(query).fetchone()
```

**Agent output (analysis step):**
```json
{
  "issues": [
    {
      "severity": "critical",
      "category": "security",
      "message": "SQL query built with string concatenation — classic SQL injection vulnerability.",
      "suggestion": "Use parameterised queries: conn.execute('SELECT * FROM users WHERE username = ?', (username,))"
    },
    {
      "severity": "info",
      "category": "error-handling",
      "message": "No handling for the case where the user is not found (fetchone() returns None).",
      "suggestion": "Return None explicitly or raise a domain-specific exception so callers know to handle the missing-user case."
    }
  ],
  "summary": "Critical SQL injection vulnerability present. The function also lacks handling for a missing user result."
}
```

---

## Example 3 — Clean Code (no issues)

**Input:**
```ts
async function getPost(id: string): Promise<Post> {
  const res = await fetch(`/api/posts/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch post ${id}: ${res.status}`);
  }
  return res.json() as Promise<Post>;
}
```

**Agent output (analysis step):**
```json
{
  "issues": [],
  "summary": "Well-structured async function with proper error handling, URL encoding, and TypeScript typing. No issues found."
}
```

The correction step is **skipped** — the graph routes directly to END when the issues array is empty.
