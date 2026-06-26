# Project Core Constitution (Non-Negotiable Axioms)

You must strictly adhere to this baseline constitution on every interaction. These principles override any speculative alternative design choices.

1. **The Separation Axiom:** Business logic, asynchronous networking, and API execution layers must remain entirely separated from visual user interface rendering trees. Inline data manipulation inside components is a constitutional violation.
2. **The Modernity Directive:** Asynchronous code blocks must exclusively utilize typed `async/await` syntax with strict `try/catch` error validation. The legacy `.then()` Promise pattern is strictly prohibited throughout this repository.
3. **The Architecture Anchor:** Next.js App Router root layout pages (`page.tsx`) must always remain highly performant Server Components. Interactive state mechanics must be aggressively isolated into dedicated client-side sub-components.
4. **The Structural Uniformity Rule:** All codebase source files, custom hooks, and utility files must follow a lowercase, dash-separated kebab-case naming scheme to prevent cross-platform file system mismatches.
5. **The Privacy Axiom:** No API keys, personal data, or sensitive information may be hardcoded or committed. All secrets must be sourced via environment variables, with a `.env.example` provided for reference.
6. **The Clarity Mandate:** Every exported function and module must include concise doc comments explaining purpose, inputs, and outputs. The README must include a working usage example with sample input/output.

## Project Core & Tech Stack
- **Goal:** Code Review Assistant
- **Framework:** Next.js (App Router)
- **Language:** TypeScript (Strict compliance)
- **Package Manager:** pnpm
- **AI / Workflow Engine:** LangGraph.js

## CLI Execution Commands
- Install Dependencies: `pnpm install`
- Start Dev Server: `pnpm dev`
- Build Application: `pnpm build`
- Lint Codebase: `pnpm lint`
