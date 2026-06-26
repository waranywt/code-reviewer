---
description: Mandatory code quality and determinism checks applied when modifying any source code files.
globs: "src/**/*.(ts|tsx), app/**/*.(ts|tsx)"
---

# Deterministic Execution Constraints

You must strictly mirror the exact coding patterns found in existing files. Do not introduce alternative architectures, new syntax styles, or uninstalled external npm packages.

## Pre-Flight Verification Loop
Before modifying or writing any file, you must explicitly answer these three questions in your internal reasoning:
1. What is the precise folder location this file belongs in according to our feature-first architecture?
2. What existing helper utility or abstract API wrapper in this codebase should this code reuse?
3. Does this implementation perfectly match the kebab-case file naming rules?

Failure State Block: Writing duplicate, non-standard helper functions is strictly forbidden.
