---
description: Mandatory verification checks to completely prevent hallucinated imports, methods, or utilities.
globs: "src/**/*.(ts|tsx), app/**/*.(ts|tsx)"
---

# 🚫 Hallucination Prevention Protocol

You are strictly forbidden from writing code based on assumptions about this repository's utility functions, global types, or installed dependencies.

## Grounding Checks
- **Import Verification:** Never assume an export exists in another file. You must explicitly open and verify the target file's export signatures (`view_file`) before writing an import statement targeting it.
- **Dependency Guard:** Never import an external npm library unless you have explicitly checked `package.json` to verify it is already installed.

## The Compiling Validation Gate
Every single time you add or modify code, you must immediately execute these terminal commands before declaring the task complete:
1. Run `npm run build` or your local TypeScript compiler check to verify type safety.

## Self-Correction Loop
If the lint or build command outputs an error, do not ask the developer for help. You must intercept the compiler error text, locate the file path, and rewrite the hallucinated logic to fix the build breakage immediately.
