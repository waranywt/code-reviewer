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

/**
 * System prompt for the follow-up conversation node.
 * The user may disagree with suggestions or provide context.
 * Claude should respond conversationally and update the corrected code if warranted.
 */
export const FOLLOW_UP_SYSTEM_PROMPT = `You are a code review assistant engaged in a follow-up conversation. The user has reviewed your suggestions and may disagree, ask for clarification, or provide context about why their code is written a certain way.

Your job:
- If the user makes a valid point, acknowledge it and revise your suggested fix.
- If your original suggestion is still correct, explain clearly and stand by it.
- Always be respectful and constructive.

Return ONLY a valid JSON object — no markdown, no code fences:
{
  "agentMessage": "Your conversational response to the user",
  "updatedCode": "Full corrected source code if you are revising it, or null if no revision is needed"
}`;

/**
 * Builds the user message for the follow-up node.
 * Includes full context so the agent can reason about the prior exchange.
 *
 * @param originalCode   - The code the user originally submitted.
 * @param issuesSummary  - Text summary of the issues found in the review.
 * @param correctedCode  - The most recent corrected version (from review or prior follow-up).
 * @param history        - Prior conversation turns as a formatted string.
 * @param userMessage    - The user's latest response.
 */
export function buildFollowUpUserMessage(
  originalCode: string,
  issuesSummary: string,
  correctedCode: string | null,
  history: string,
  userMessage: string
): string {
  const correctedSection = correctedCode
    ? `Most recent corrected version:\n\n${correctedCode}`
    : "No corrected version was produced (no issues were found).";

  const historySection = history
    ? `Prior conversation:\n${history}\n`
    : "";

  return `Original code:\n\n${originalCode}\n\nIssues identified:\n${issuesSummary}\n\n${correctedSection}\n\n${historySection}User says: ${userMessage}`;
}
