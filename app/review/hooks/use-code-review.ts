"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import type { ReviewResult } from "../types/review-types";

async function reviewCode(code: string): Promise<ReviewResult> {
  if (!code.trim()) {
    throw new Error("Code must not be empty.");
  }

  return api.post<ReviewResult>("/review/api", { code });
}

export function useCodeReview(): UseMutationResult<ReviewResult, Error, string> {
  return useMutation({
    mutationFn: reviewCode,
  });
}
