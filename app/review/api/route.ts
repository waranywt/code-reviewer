import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runReviewAgent } from "../agent/review-graph";
import type { ReviewResponse } from "../types/review-types";

const RequestSchema = z.object({
  code: z
    .string()
    .min(1, "Code snippet cannot be empty")
    .max(10_000, "Code snippet must be under 10 000 characters"),
});

/**
 * POST /review/api
 * Accepts a JSON body `{ code: string }` and returns a `ReviewResponse`.
 */
export async function POST(req: NextRequest): Promise<NextResponse<ReviewResponse>> {
  try {
    const body: unknown = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }

    const result = await runReviewAgent(parsed.data.code);
    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
