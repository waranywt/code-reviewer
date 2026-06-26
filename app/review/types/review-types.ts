/** Severity level for a single review finding. */
export type Severity = "info" | "warning" | "critical";

/** Category of a review finding. */
export type Category =
  | "code-style"
  | "potential-bug"
  | "error-handling"
  | "security";

/** A single issue identified during code analysis. */
export interface ReviewIssue {
  severity: Severity;
  category: Category;
  message: string;
  /** Concrete suggestion for how to resolve the issue. */
  suggestion: string;
}

/** The complete result returned by the review agent. */
export interface ReviewResult {
  /** Original code that was submitted for review. */
  originalCode: string;
  /** Ordered list of issues found, highest severity first. */
  issues: ReviewIssue[];
  /**
   * Claude-generated corrected version of the code.
   * Only present when at least one issue was found.
   */
  correctedCode: string | null;
  /** Human-readable summary of the review. */
  summary: string;
}

/** Shape of the POST /review/api request body. */
export interface ReviewRequest {
  code: string;
}

/** Shape of the POST /review/api JSON response. */
export type ReviewResponse =
  | { success: true; result: ReviewResult }
  | { success: false; error: string };
