"use client";

import { useState } from "react";
import { useCodeReview } from "../hooks/use-code-review";
import { getErrorMessage } from "../utils/get-error-message";
import { ReviewResults } from "./review-results";

const PLACEHOLDER = `// Paste your code here — any language works.
// Example:
function fetchUser(id) {
  return fetch('/api/users/' + id).then(r => r.json());
}`;

/**
 * Full interactive review panel: textarea input, submit button,
 * loading state, error display, and results rendering.
 * This is the top-level client component mounted by the review page.
 */
export function CodeInputForm(): React.ReactElement {
  const [code, setCode] = useState("");
  const mutation = useCodeReview();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!code.trim()) return;
    await mutation.mutateAsync(code.trim());
  }

  function handleReset(): void {
    setCode("");
    mutation.reset();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="code-input"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Code Snippet
          </label>
          <textarea
            id="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={PLACEHOLDER}
            disabled={mutation.isPending}
            rows={14}
            className="w-full font-mono text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 resize-y"
            aria-label="Code to review"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {code.length} / 10 000 characters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending || !code.trim()}
            className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? "Analysing…" : "Review Code"}
          </button>

          {(mutation.data ?? mutation.error) && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
      </form>

      {/* Loading */}
      {mutation.isPending && (
        <div
          role="status"
          aria-label="Analysing code"
          className="flex items-center gap-3 text-gray-500 text-sm"
        >
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          Running agentic review — this may take a few seconds…
        </div>
      )}

      {/* Error */}
      {mutation.error && !mutation.isPending && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700"
        >
          <strong className="font-semibold">Error: </strong>
          {getErrorMessage(mutation.error)}
        </div>
      )}

      {/* Results */}
      {mutation.data && !mutation.isPending && <ReviewResults result={mutation.data} />}
    </div>
  );
}
