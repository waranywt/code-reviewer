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

/** A single turn in the follow-up conversation between the user and the agent. */
export interface ConversationTurn {
  role: "user" | "agent";
  message: string;
  /** Present on agent turns when the agent revises the corrected code. */
  updatedCode?: string | null;
}

/** Result returned by the follow-up agent after the user responds to a review. */
export interface FollowUpResult {
  agentMessage: string;
  /** New corrected version if the agent agreed to update it, otherwise null. */
  updatedCode: string | null;
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

