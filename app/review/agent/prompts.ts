/**
 * System prompt for the analysis node.
 * Instructs Claude to return a strict JSON object — no markdown fences.
 */
export const ANALYSIS_SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the submitted code snippet and return ONLY a valid JSON object — no markdown, no code fences, no explanation outside the JSON.

The JSON must conform exactly to this shape:
{
  "issues": [
    {
      "severity": "info" | "warning" | "critical",
      "category": "code-style" | "potential-bug" | "error-handling" | "security",
      "message": "Clear description of the problem",
      "suggestion": "Concrete fix or improvement"
    }
  ],
  "summary": "One or two sentence overview of the code quality"
}

Rules:
- severity "critical" = data loss, security vulnerability, or definite crash
- severity "warning"  = likely bug or bad practice under real-world conditions
- severity "info"     = style, readability, or minor improvement
- Order issues from highest to lowest severity
- If no issues are found, return an empty "issues" array
- Never include personal opinions unrelated to correctness or safety`;

/**
 * System prompt for the correction node.
 * Instructs Claude to return only the corrected source code — no prose.
 */
export const CORRECTION_SYSTEM_PROMPT = `You are an expert software engineer. You will be given:
1. The original code snippet
2. A list of issues that were found in it

Return ONLY the corrected source code that resolves all listed issues. Do not include any explanation, markdown fences, or commentary — just the raw, corrected code.`;

/**
 * Builds the user message for the analysis node.
 * @param code - The raw code snippet submitted by the user.
 */
export function buildAnalysisUserMessage(code: string): string {
  return `Please review this code:\n\n${code}`;
}

/**
 * Builds the user message for the correction node.
 * @param code   - The original code snippet.
 * @param issues - Serialised list of issues from the analysis step.
 */
export function buildCorrectionUserMessage(
  code: string,
  issues: string
): string {
  return `Original code:\n\n${code}\n\nIssues to fix:\n${issues}`;
}
