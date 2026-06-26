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
// Tool schema — forces Claude to always return structured output.
// Using tool_choice: { type: "tool" } eliminates all JSON parsing issues.
// ---------------------------------------------------------------------------

const ANALYSIS_TOOL: Anthropic.Messages.Tool = {
  name: "submit_analysis",
  description: "Submit the structured code review findings.",
  input_schema: {
    type: "object",
    properties: {
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            severity: { type: "string", enum: ["info", "warning", "critical"] },
            category: {
              type: "string",
              enum: ["code-style", "potential-bug", "error-handling", "security"],
            },
            message: { type: "string" },
            suggestion: { type: "string" },
          },
          required: ["severity", "category", "message", "suggestion"],
        },
      },
      summary: { type: "string" },
    },
    required: ["issues", "summary"],
  },
};

// ---------------------------------------------------------------------------
// Anthropic client
// ---------------------------------------------------------------------------

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  return new Anthropic({ apiKey });
}

// ---------------------------------------------------------------------------
// Node: analyze
// ---------------------------------------------------------------------------

export async function analyzeNode(state: ReviewState): Promise<Partial<ReviewState>> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: ANALYSIS_SYSTEM_PROMPT,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: "tool", name: "submit_analysis" },
    messages: [{ role: "user", content: buildAnalysisUserMessage(state.code) }],
  });

  const toolBlock = message.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Analyze node did not receive a tool_use response block");
  }

  const input = toolBlock.input as { issues: ReviewIssue[]; summary: string };
  return {
    issues: input.issues ?? [],
    summary: input.summary ?? "",
  };
}

// ---------------------------------------------------------------------------
// Node: correct
// Returns raw corrected code — no structured output needed.
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

  const correctedCode = (message.content[0] as { type: "text"; text: string }).text.trim();
  return { correctedCode };
}

// ---------------------------------------------------------------------------
// Conditional routing
// ---------------------------------------------------------------------------

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
