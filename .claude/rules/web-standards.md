---
description: Mandatory UI styling, Next.js client component limits, and TanStack Query hook hygiene rules.
globs: "app/**/*.(ts|tsx), components/**/*.(ts|tsx)"
---

# Web UI & Directory Standards

## 1. Feature-First Folder Layout
- Follow a strict **Feature-First modular folder layout**. Keep UI components, custom hooks, types, and localized helpers grouped entirely inside the feature directory (e.g., `app/profile/hooks/`).
- Server-Sent Events (SSE) and long-running secure streaming endpoints belong in a local `api/route.ts` file within their respective feature folder.

## 2. Naming Conventions
- **Files & Folders:** Strictly use lowercase **kebab-case** for all files and directories (e.g., `use-cycle-status.ts`). No exceptions for helper utilities or custom hooks.
- **Components Files:** Name actual React components using PascalCase filenames matching the internal declaration (e.g., `ProfileForm.tsx`).
- **Variables & Functions:** Use standard **camelCase** for local state variables and synchronous helper functions.

## 3. State & Data Fetching Hygiene
- **Client-Side Fetching:** Always abstract asynchronous network calls inside a custom React hook leveraging **TanStack Query (`useQuery` / `useMutation`)**.
- **Component Hygiene:** Never declare `useQuery`, `useMutation`, or raw `fetch()` blocks directly inline within a visual UI component view. They must be extracted to the feature's `hooks/` directory.
- **Caching Updates:** Prefer calling `queryClient.invalidateQueries` inside mutation success side-effects by default to guarantee server-state alignment. Use `queryClient.setQueryData` explicitly for high-frequency user interface optimization or optimistic updates.
- **No Manual Async State Tracking:** Custom hooks must never manage raw `useState` and `try/catch` boilerplate blocks to track loading booleans, error strings, or response payloads for network operations. Let TanStack Query natively handle state tracking (`mutation.isPending`, `mutation.error`, etc.) to eliminate code smell regressions.

## 4. Component Refactoring & Code Quality Limits
- **Single Responsibility:** Every file must have one single responsibility. If a component handles both data layout and deep data formatting, break it up.
- **Strict File Length Limits:** Keep files small and highly scannable.
  - Visual UI components should target under **150 lines of code**.
  - Custom hooks and utility files should target under **100 lines of code**.
- **Component Splitting:** If a visual component contains nested loops (`.map()`) or conditional sections that exceed 30 lines of JSX, immediately extract that section into a localized, smaller sub-component within the same feature folder.
- **Utility Extraction:** Do not write heavy data manipulation, date formatting, or string parsing directly inside components or hooks. Extract them into pure, testable helper functions in a local `utils/` folder or file.
- **Proactive Refactoring:** When asked to modify an existing large file, prioritize breaking it apart into smaller, compliant modules first before adding any new feature code.
