import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runFollowUpAgent } from "../../agent/follow-up";
import type { FollowUpResult } from "../../types/review-types";

const ConversationTurnSchema = z.object({
  role: z.enum(["user", "agent"]),
  message: z.string(),
  updatedCode: z.string().nullable().optional(),
});

const ReviewIssueSchema = z.object({
  severity: z.enum(["info", "warning", "critical"]),
  category: z.enum(["code-style", "potential-bug", "error-handling", "security"]),
  message: z.string(),
  suggestion: z.string(),
});

const RequestSchema = z.object({
  originalCode: z.string().min(1),
  issues: z.array(ReviewIssueSchema),
  correctedCode: z.string().nullable(),
  history: z.array(ConversationTurnSchema),
  userMessage: z.string().min(1, "Message cannot be empty").max(2000),
});

/**
 * POST /review/api/follow-up
 * Continues the conversation after the initial review.
 * Returns `FollowUpResult` on 200, `{ error: string }` on 400/500.
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<FollowUpResult | { error: string }>> {
  try {
    const body: unknown = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { originalCode, issues, correctedCode, history, userMessage } = parsed.data;

    const result = await runFollowUpAgent(
      originalCode,
      issues,
      correctedCode,
      history,
      userMessage
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
