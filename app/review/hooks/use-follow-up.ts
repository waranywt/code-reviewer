"use client";

import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { api } from "@/app/lib/api";
import type { ConversationTurn, FollowUpResult, ReviewIssue } from "../types/review-types";

export interface FollowUpPayload {
  originalCode: string;
  issues: ReviewIssue[];
  correctedCode: string | null;
  history: ConversationTurn[];
  userMessage: string;
}

/** Send a follow-up message to the review agent and receive a conversational response. */
export function useFollowUp(): UseMutationResult<FollowUpResult, Error, FollowUpPayload> {
  return useMutation({
    mutationFn: (payload: FollowUpPayload) =>
      api.post<FollowUpResult>("/review/api/follow-up", payload),
  });
}
