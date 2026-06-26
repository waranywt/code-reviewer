"use client";

import { useState } from "react";
import type { ReviewResponse, ReviewResult } from "../types/review-types";

export interface UseCodeReviewReturn {
  /** Submit code for review. Resolves when the agent has finished. */
  submitReview: (code: string) => Promise<void>;
  result: ReviewResult | null;
  isLoading: boolean;
  error: string | null;
  /** Reset state so the user can start a new review. */
  reset: () => void;
}

/**
 * Manages the async lifecycle of a single code review request.
 * Calls POST /review/api and surfaces loading, result, and error states.
 */
export function useCodeReview(): UseCodeReviewReturn {
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitReview(code: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/review/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data: ReviewResponse = await res.json() as ReviewResponse;

      if (!data.success) {
        setError(data.error);
        return;
      }

      setResult(data.result);
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function reset(): void {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }

  return { submitReview, result, isLoading, error, reset };
}
