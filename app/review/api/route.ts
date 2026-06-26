import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runReviewAgent } from "../agent/review-graph";
import type { ReviewResult } from "../types/review-types";

const RequestSchema = z.object({
  code: z
    .string()
    .min(1, "Code snippet cannot be empty")
    .max(10_000, "Code snippet must be under 10 000 characters"),
});

/**
 * POST /review/api
 * Accepts `{ code: string }`, returns `ReviewResult` on 200.
 * Returns `{ error: string }` with status 400 or 500 on failure
 * (axios throws on non-2xx, so callers never need to check a success flag).
 */
export async function POST(req: NextRequest): Promise<NextResponse<ReviewResult | { error: string }>> {
  try {
    const body: unknown = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const result = await runReviewAgent(parsed.data.code);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
