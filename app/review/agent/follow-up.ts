import Anthropic from "@anthropic-ai/sdk";
import type { ConversationTurn, FollowUpResult, ReviewIssue } from "../types/review-types";
import { FOLLOW_UP_SYSTEM_PROMPT, buildFollowUpUserMessage } from "./prompts";

// ---------------------------------------------------------------------------
// Tool schema — forces Claude to always return structured output.
// ---------------------------------------------------------------------------

const FOLLOW_UP_TOOL: Anthropic.Messages.Tool = {
  name: "submit_follow_up",
  description: "Submit the follow-up response to the user.",
  input_schema: {
    type: "object",
    properties: {
      agentMessage: {
        type: "string",
        description: "Conversational response to the user's message",
      },
      updatedCode: {
        type: "string",
        description: "Full revised source code if updating the suggestion, otherwise omit",
      },
    },
    required: ["agentMessage"],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  return new Anthropic({ apiKey });
}

function formatIssues(issues: ReviewIssue[]): string {
  if (issues.length === 0) return "None.";
  return issues
    .map(
      (i, idx) =>
        `${idx + 1}. [${i.severity.toUpperCase()}] ${i.category}: ${i.message} — ${i.suggestion}`
    )
    .join("\n");
}

function formatHistory(history: ConversationTurn[]): string {
  return history
    .map((t) => `${t.role === "user" ? "User" : "Agent"}: ${t.message}`)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a follow-up message to the review agent.
 * Returns the agent's conversational response and an optionally revised corrected code.
 *
 * @param originalCode  - The code originally submitted for review.
 * @param issues        - Issues identified during the initial review.
 * @param correctedCode - The most recent corrected version of the code.
 * @param history       - All prior follow-up turns (excluding the current user message).
 * @param userMessage   - The user's latest message.
 */
export async function runFollowUpAgent(
  originalCode: string,
  issues: ReviewIssue[],
  correctedCode: string | null,
  history: ConversationTurn[],
  userMessage: string
): Promise<FollowUpResult> {
  const client = getClient();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: FOLLOW_UP_SYSTEM_PROMPT,
    tools: [FOLLOW_UP_TOOL],
    tool_choice: { type: "tool", name: "submit_follow_up" },
    messages: [
      {
        role: "user",
        content: buildFollowUpUserMessage(
          originalCode,
          formatIssues(issues),
          correctedCode,
          formatHistory(history),
          userMessage
        ),
      },
    ],
  });

  const toolBlock = message.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Follow-up agent did not receive a tool_use response block");
  }

  const input = toolBlock.input as { agentMessage: string; updatedCode?: string };
  return {
    agentMessage: input.agentMessage,
    updatedCode: input.updatedCode ?? null,
  };
}
