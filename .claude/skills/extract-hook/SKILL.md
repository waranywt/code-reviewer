---
name: extract-hook
description: Automates splitting a monolithic page file by extracting inline API calls into clean kebab-case TanStack hooks.
version: 1.0.0
allowed-tools:
  - view_file
  - write_file
  - grep
---

# 🛠️ Extract Hook Procedural Blueprint

When the developer requests an extraction pass on a specific file, you must execute this sequence precisely:

## Phase 1: Isolated Investigation
1. Open the target file using `view_file`.
2. Locate all instances of raw network fetches (`fetch`, `axios`) and inline data states (`useState`, `useEffect`) managing that network data.

## Phase 2: Build the Type Spec
1. Inspect the incoming backend JSON response schema.
2. Create a dedicated `types.ts` file or section defining the exact TypeScript interface contract.

## Phase 3: Generate the Modular Hook
1. Create a brand new file inside the local feature subfolder matching the path format: `hooks/use-[feature-name].ts`.
2. Wrap the async network call inside a TanStack Query `useQuery` or `useMutation` block using `async/await` syntax.
3. Add an explicit named export for the custom hook.

## Phase 4: UI Cleanup and Compilation
1. Delete the raw state variables and `useEffect` blocks from the original component.
2. Import and consume the new custom hook cleanly inside the component view.
3. Run `npm run lint` and `npm run build` to verify zero regressions.
