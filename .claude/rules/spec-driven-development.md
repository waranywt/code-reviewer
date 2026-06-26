---
description: Rules to enforce strict contract-first type matching and API interface validation.
globs: "src/**/*.(ts|tsx), app/**/*.(ts|tsx)"
---

# Spec-Driven Development Guardrails

You must always build data layers against strict structural specifications and type contracts. Spec-driven engineering overrides speculative coding.

## Data Contract Enforcements
- **Interface First:** Before creating a custom hook or API fetch routine, you must create or locate the exact TypeScript `interface` or `type` matching the backend API payload schema.
- **Explicit Return Types:** Every single function, helper utility, and custom React hook must have an explicitly declared return type definition. Implicit `any` types or inferred complex returns are strictly forbidden.
- **API Param Validation:** When writing functions that accept query parameters or dynamic path values (like `date` or `id`), you must wrap those values in type constraints to ensure invalid parameters are caught at compile time.
- **Match the Source of Truth:** Never invent a placeholder mock schema. If an external API contract updates, update the centralized type specification file first, then refactor downstream hooks to match.
