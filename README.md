# Code Review Assistant

An AI-powered code review tool built with **Next.js**, **TypeScript**, **LangGraph.js**, and the **Claude API**. Paste any code snippet and the agent will identify style issues, potential bugs, missing error handling, and security concerns — then automatically produce a corrected version when needed.

## What it does

1. You paste a code snippet into the web UI and click **Review Code**.
2. A LangGraph agent runs two steps server-side:
   - **Analyze** — Claude inspects the code and returns structured JSON (issues with `severity`, `category`, `message`, and `suggestion`).
   - **Correct** — if issues were found, Claude generates a fixed version of the code.
3. The UI renders the summary, a colour-coded issue list (info / warning / critical), and a side-by-side diff of the original vs. corrected code.

### Agent flow

```
START → [analyze node] → (issues found?) → YES → [correct node] → END
                                          → NO  → END
```

The conditional edge is the agentic loop: the graph decides whether a second LLM call is warranted based on the first result.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| AI orchestration | LangGraph.js |
| LLM | Claude (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` |
| Styling | Tailwind CSS |
| Package manager | pnpm |

## Project structure

```
app/
  layout.tsx                 # Root server component
  page.tsx                   # Redirects / → /review
  review/
    page.tsx                 # Static server-component shell
    api/
      route.ts               # POST /review/api — runs the agent
    agent/
      review-graph.ts        # LangGraph StateGraph (analyze + correct nodes)
      prompts.ts             # Claude system prompts and message builders
    components/
      code-input-form.tsx    # Client component: textarea + submit
      review-results.tsx     # Client component: renders feedback
      issue-card.tsx         # Sub-component: single issue with severity badge
    hooks/
      use-code-review.ts     # Fetch hook (loading / result / error state)
    types/
      review-types.ts        # Shared TypeScript interfaces
examples/
  sample-inputs-outputs.md   # Example agent inputs and structured outputs
```

## Setup

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
git clone <repo-url>
cd code-reviewer
pnpm install
```

### Environment

```bash
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key
```

```env
ANTHROPIC_API_KEY=your_api_key_here
```

### Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/review`.

## Usage example

**Input** (paste into the text area):
```js
function fetchUser(id) {
  return fetch('/api/users/' + id).then(r => r.json());
}
```

**Output** — three issues are surfaced:

| # | Severity | Category | Message |
|---|---|---|---|
| 1 | Critical | Error Handling | No error handling — network failures silently produce garbage data |
| 2 | Warning | Code Style | Uses `.then()` instead of `async/await` |
| 3 | Warning | Security | String concatenation for URL path can introduce path-traversal |

A corrected version is shown alongside the original:
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

See [examples/sample-inputs-outputs.md](examples/sample-inputs-outputs.md) for more examples including a clean-code case where the correction step is skipped.

## Key design decisions

- **Server/Client separation** — the agent runs entirely on the server (API route). The client only renders state; it never touches the Anthropic SDK directly.
- **Structured JSON output** — the analysis prompt instructs Claude to return strict JSON, not prose, so the UI can render typed data without parsing markdown.
- **Conditional agentic loop** — the LangGraph conditional edge means the second LLM call (correction) only fires when needed, keeping latency low for clean code.
- **Zod input validation** — the API route validates and sanitises all user input before it reaches the agent.
