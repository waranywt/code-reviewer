---
description: Mandatory prompt enforcement metrics for component sizes and structural layout choices.
globs: "src/**/*.(ts|tsx), app/**/*.(ts|tsx)"
---

# Prompting & Structural Layout Constraints

To maintain a clean, readable architecture, all code transformations must follow strict, quantifiable style metrics rather than arbitrary design choices.

## Strict File & Component Metrics
- **Max File Lengths:** Keep files small and highly scannable. 
  - Visual UI components (`.tsx`) must remain under **150 lines of code**.
  - Custom hooks (`.ts`) and utility files must remain under **100 lines of code**.
- **Component Splitting Threshold:** If any visual component contains nested loops (`.map()`) or conditional render blocks that exceed **30 lines of JSX**, you must immediately extract that section into its own localized, smaller sub-component file.
- **Pure Utility Isolation:** Never write heavy data manipulation, date formatting, or string parsing directly inline inside your hooks or component views. Extract them into pure, testable helper functions inside a local `utils/` file.
