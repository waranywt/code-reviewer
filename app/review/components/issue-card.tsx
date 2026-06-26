"use client";

import type { ReviewIssue, Severity } from "../types/review-types";

interface IssueCardProps {
  issue: ReviewIssue;
  index: number;
}

const SEVERITY_STYLES: Record<Severity, { badge: string; border: string; label: string }> = {
  critical: {
    badge: "bg-red-100 text-red-800 border border-red-200",
    border: "border-l-red-500",
    label: "Critical",
  },
  warning: {
    badge: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    border: "border-l-yellow-500",
    label: "Warning",
  },
  info: {
    badge: "bg-blue-100 text-blue-800 border border-blue-200",
    border: "border-l-blue-400",
    label: "Info",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  "code-style": "Code Style",
  "potential-bug": "Potential Bug",
  "error-handling": "Error Handling",
  security: "Security",
};

/**
 * Renders a single review finding with its severity badge, category, message,
 * and suggested fix.
 */
export function IssueCard({ issue, index }: IssueCardProps): React.ReactElement {
  const styles = SEVERITY_STYLES[issue.severity];

  return (
    <div
      className={`border-l-4 ${styles.border} bg-white rounded-r-lg p-4 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles.badge}`}>
          {styles.label}
        </span>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {CATEGORY_LABELS[issue.category] ?? issue.category}
        </span>
      </div>
      <p className="text-sm text-gray-800 font-medium mb-1">{issue.message}</p>
      <p className="text-sm text-gray-500">
        <span className="font-medium text-gray-700">Fix: </span>
        {issue.suggestion}
      </p>
    </div>
  );
}
