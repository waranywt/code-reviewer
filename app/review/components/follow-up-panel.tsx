"use client";

import { useState } from "react";
import { useFollowUp } from "../hooks/use-follow-up";
import { getErrorMessage } from "../utils/get-error-message";
import type { ConversationTurn, ReviewIssue } from "../types/review-types";

interface FollowUpPanelProps {
  originalCode: string;
  issues: ReviewIssue[];
  correctedCode: string | null;
}

/**
 * Renders the follow-up conversation thread below a completed review.
 * The user can respond to the agent's suggestions; the agent replies and
 * optionally revises the corrected code.
 */
export function FollowUpPanel({
  originalCode,
  issues,
  correctedCode,
}: FollowUpPanelProps): React.ReactElement {
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const mutation = useFollowUp();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    const userTurn: ConversationTurn = { role: "user", message: trimmed };
    const nextHistory = [...history, userTurn];
    setMessage("");

    const result = await mutation.mutateAsync({
      originalCode,
      issues,
      correctedCode,
      history,
      userMessage: trimmed,
    });

    const agentTurn: ConversationTurn = {
      role: "agent",
      message: result.agentMessage,
      updatedCode: result.updatedCode,
    };

    setHistory([...nextHistory, agentTurn]);
  }

  return (
    <div className="border-t border-gray-200 pt-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Respond to the Agent
      </h2>

      {/* Conversation thread */}
      {history.length > 0 && (
        <ul className="space-y-4">
          {history.map((turn, i) => (
            <li key={i}>
              {turn.role === "user" ? (
                <UserBubble message={turn.message} />
              ) : (
                <AgentBubble message={turn.message} updatedCode={turn.updatedCode ?? null} />
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Error */}
      {mutation.error && !mutation.isPending && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700"
        >
          <strong className="font-semibold">Error: </strong>
          {getErrorMessage(mutation.error)}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explain why you disagree, or ask the agent to clarify…"
          disabled={mutation.isPending}
          rows={3}
          className="w-full text-sm text-gray-900 placeholder:text-gray-400 border border-gray-300 rounded-lg p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-60 resize-none"
        />
        <button
          type="submit"
          disabled={mutation.isPending || !message.trim()}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending ? "Thinking…" : "Send"}
        </button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function UserBubble({ message }: { message: string }): React.ReactElement {
  return (
    <div className="flex justify-end">
      <div className="max-w-xl bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3">
        <p className="text-xs font-semibold text-indigo-500 mb-1">You</p>
        <p className="text-sm text-gray-800">{message}</p>
      </div>
    </div>
  );
}

function AgentBubble({
  message,
  updatedCode,
}: {
  message: string;
  updatedCode: string | null;
}): React.ReactElement {
  return (
    <div className="flex justify-start">
      <div className="max-w-xl space-y-3">
        <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Agent</p>
          <p className="text-sm text-gray-800">{message}</p>
        </div>
        {updatedCode && (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              Revised code
            </p>
            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-auto max-h-72 leading-relaxed">
              <code>{updatedCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
