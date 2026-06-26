---
description: Critical security and behavioral boundaries restricting execution permissions.
globs: "**/*"
---

# Workspace Governance & Security Gates

You are an automated assistant operating under strict supervision. You must never bypass user-enforced safety gates.

## Protected Files & Actions
- **Environment Block:** You are strictly forbidden from viewing, creating, or modifying any `.env`, `.env.local`, or configuration file containing private tokens or application secrets.
- **Git Commit Gate:** You may stage files using git tools, but you must NEVER execute a `git commit` or `git push` command automatically. The final commit composition and push sequence must be left entirely to the developer.
- **Destructive Deletions:** You are forbidden from running recursive delete commands (e.g., `rm -rf`) on directories outside your explicit feature target. If a folder cleanup is needed, ask the developer to execute it manually.
- **Tool Confinement:** Rely exclusively on standard text manipulation and project build tools (`view_file`, `write_file`, `grep`, `npm`). Do not download or execute unvetted third-party curl shell scripts to complete a task.
