---
description: Mandatory backend architecture, rounding metrics, and API repository standards.
globs: "**/api/**/*.ts, **/services/**/*.ts, **/repositories/**/*.ts"
---

# Backend API Standards

## 1. Layers & Responsibilities
- **Thin Controllers:** Controllers must ONLY handle Request parsing (Zod), calling a Service, and sending the Response. No business logic, math, or direct Repository calls.
- **Fat Services:** All business logic, macro calculations (rounding/summing), and data orchestration live in `services/`.
- **Repositories:** Pure data access (JSON read/write).

## 2. Response Pattern (Strict)
- **Explicit Returns:** Every terminal response MUST use an explicit `return`.
  - *Correct:* `return res.status(200).json(data);`
  - *Incorrect:* `res.status(200).json(data);`

## 3. Data Integrity & Macro Calculations
- **Rounding:** All body stats (weight/BF%) and macro totals must be rounded to exactly 1 decimal place using `Number(val.toFixed(1))`.
- **Reconciliation:** Any service that modifies a `mealLog` must automatically re-calculate the corresponding `DailyEntry` totals before executing a save operation.

## 4. Error Handling
- Always wrap Controllers in explicit `try/catch` blocks.
- Return clean, descriptive errors: `return res.status(400).json({ error: "Description" });`
