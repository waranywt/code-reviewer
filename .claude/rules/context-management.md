---
description: Constraints for managing token budgets and context window limits during exploration.
globs: "**/*"
---

# Tokens & Context Management Boundaries

To prevent context memory bloat and conserve the project token budget, you must follow a strict progressive discovery approach when navigating the workspace.

## Token Gating Rules
- **Look Before You Leap:** Never use bulk search or broad directory reading tools (like `grep` or reading a whole folder) on the entire codebase all at once. Narrow down your scope to a single feature folder first.
- **Strict Read Limits:** Do not read or view more than **2 files simultaneously** in a single response turn. 
- **The Compaction Checkpoint:** Before opening additional files, you must output a concise, 2-line summary in your response of what you discovered in the previous files, along with an explicit justification for why the next file is absolutely required.
- **Abort Mass Refactors:** If a requested task requires modifying or touching more than 5 files across different folders, stop immediately. Present a phased milestone plan to the developer and await authorization before proceeding with the first phase.
