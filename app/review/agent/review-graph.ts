import Anthropic from "@anthropic-ai/sdk";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { ReviewIssue, ReviewResult } from "../types/review-types";
import {
  ANALYSIS_SYSTEM_PROMPT,
  CORRECTION_SYSTEM_PROMPT,
  buildAnalysisUserMessage,
  buildCorrectionUserMessage,
} from "./prompts";

// ---------------------------------------------------------------------------
// State schema
// ---------------------------------------------------------------------------

const ReviewStateAnnotation = Annotation.Root({
  code: Annotation<string>(),
  issues: Annotation<ReviewIssue[]>({
    default: () => [],
    reducer: (_, next) => next,
  }),
  correctedCode: Annotation<string | null>({
    default: () => null,
    reducer: (_, next) => next,
  }),
  summary: Annotation<string>({
    default: () => "",
    reducer: (_, next) => next,
  }),
});

export type ReviewState = typeof ReviewStateAnnotation.State;

// ---------------------------------------------------------------------------
// Anthropic client (created once, reused across invocations)
// ---------------------------------------------------------------------------

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

// ---------------------------------------------------------------------------
// Node: analyze
// Calls Claude to identify issues and produce a summary.
// ---------------------------------------------------------------------------

export async function analyzeNode(state: ReviewState): Promise<Partial<ReviewState>> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildAnalysisUserMessage(state.code) }],
  });

  const raw = (message.content[0] as { type: "text"; text: string }).text;

  // Strip markdown fences Claude occasionally adds despite the prompt instruction.
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let parsed: { issues: ReviewIssue[]; summary: string };
  try {
    parsed = JSON.parse(stripped) as { issues: ReviewIssue[]; summary: string };
  } catch {
    throw new Error(`Agent returned invalid JSON: ${stripped}`);
  }

  return {
    issues: parsed.issues ?? [],
    summary: parsed.summary ?? "",
  };
}

// ---------------------------------------------------------------------------
// Node: correct
// Only reached when issues were found. Asks Claude for a corrected version.
// ---------------------------------------------------------------------------

async function correctNode(state: ReviewState): Promise<Partial<ReviewState>> {
  const client = getClient();

  const issuesText = state.issues
    .map(
      (i, idx) =>
        `${idx + 1}. [${i.severity.toUpperCase()}] ${i.category}: ${i.message} — ${i.suggestion}`
    )
    .join("\n");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: CORRECTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: buildCorrectionUserMessage(state.code, issuesText),
      },
    ],
  });

  const correctedCode = (
    message.content[0] as { type: "text"; text: string }
  ).text.trim();

  return { correctedCode };
}

// ---------------------------------------------------------------------------
// Conditional routing
// ---------------------------------------------------------------------------

/** Route to correction step only when issues were found. */
function routeAfterAnalysis(state: ReviewState): "correct" | typeof END {
  return state.issues.length > 0 ? "correct" : END;
}

// ---------------------------------------------------------------------------
// Graph assembly
// ---------------------------------------------------------------------------

const graph = new StateGraph(ReviewStateAnnotation)
  .addNode("analyze", analyzeNode)
  .addNode("correct", correctNode)
  .addEdge(START, "analyze")
  .addConditionalEdges("analyze", routeAfterAnalysis, {
    correct: "correct",
    [END]: END,
  })
  .addEdge("correct", END);

const reviewAgent = graph.compile();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run the code-review agent on a submitted code snippet.
 * @param code - Raw source code string to analyse.
 * @returns A fully-populated ReviewResult.
 */
export async function runReviewAgent(code: string): Promise<ReviewResult> {
  const finalState = await reviewAgent.invoke({ code });

  return {
    originalCode: code,
    issues: finalState.issues,
    correctedCode: finalState.correctedCode,
    summary: finalState.summary,
  };
}
