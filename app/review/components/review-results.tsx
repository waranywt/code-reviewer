"use client";

import type { ReviewResult } from "../types/review-types";
import { IssueCard } from "./issue-card";

interface ReviewResultsProps {
  result: ReviewResult;
}

/**
 * Renders the full output of a completed review: summary, issue list,
 * and (when present) the corrected code alongside the original.
 */
export function ReviewResults({ result }: ReviewResultsProps): React.ReactElement {
  const hasIssues = result.issues.length > 0;

  return (
    <section aria-label="Review results" className="space-y-6">
      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Summary
        </h2>
        <p className="text-gray-800">{result.summary}</p>
        {!hasIssues && (
          <p className="mt-2 text-green-700 font-medium text-sm">
            ✓ No issues found — your code looks good!
          </p>
        )}
      </div>

      {/* Issues */}
      {hasIssues && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Issues ({result.issues.length})
          </h2>
          <ul className="space-y-3">
            {result.issues.map((issue, i) => (
              <li key={i}>
                <IssueCard issue={issue} index={i} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Side-by-side code comparison */}
      {result.correctedCode && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Code Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                Original
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-96 leading-relaxed">
                <code>{result.originalCode}</code>
              </pre>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                Corrected
              </p>
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-96 leading-relaxed">
                <code>{result.correctedCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
