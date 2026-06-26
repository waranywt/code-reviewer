import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, "../.env.local") });

import Anthropic from "@anthropic-ai/sdk";
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";
import { analyzeNode } from "../app/review/agent/review-graph";
import type { ReviewIssue } from "../app/review/types/review-types";

// ---------------------------------------------------------------------------
// Dataset
// ---------------------------------------------------------------------------

const DATASET_NAME = "Review-Node-Evals";

const TEST_CASES = [
  {
    input: `function fetchUser(id) {
  return fetch('/api/users/' + id).then(r => r.json());
}`,
    expected:
      "Should flag: missing error handling (critical), .then() usage (warning), and string concatenation URL path (security/warning). At least 2 issues, highest severity critical.",
  },
  {
    input: `def get_user(conn, username):
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    return conn.execute(query).fetchone()`,
    expected:
      "Should flag SQL injection as critical security issue. At least 1 critical security issue.",
  },
  {
    input: `async function getPost(id: string): Promise<Post> {
  const res = await fetch(\`/api/posts/\${encodeURIComponent(id)}\`);
  if (!res.ok) {
    throw new Error(\`Failed to fetch post \${id}: \${res.status}\`);
  }
  return res.json() as Promise<Post>;
}`,
    expected:
      "Well-written code. Should return zero or only info-level issues. No critical or warning issues.",
  },
];

// ---------------------------------------------------------------------------
// Target: call analyzeNode directly with a minimal ReviewState
// ---------------------------------------------------------------------------

async function analyzeNodeTarget(input: {
  input: string;
}): Promise<{ issues: ReviewIssue[]; summary: string; issueCount: number; hasCritical: boolean }> {
  const result = await analyzeNode({
    code: input.input,
    issues: [],
    correctedCode: null,
    summary: "",
  });

  const issues = result.issues ?? [];
  return {
    issues,
    summary: result.summary ?? "",
    issueCount: issues.length,
    hasCritical: issues.some((i) => i.severity === "critical"),
  };
}

// ---------------------------------------------------------------------------
// Judge: Claude scores issue detection quality
// ---------------------------------------------------------------------------

async function reviewNodeJudge(args: {
  outputs: Record<string, unknown>;
  inputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
}): Promise<{ key: string; score: number; comment: string }[]> {
  const anthropic = new Anthropic();
  const issues = (args.outputs.issues as ReviewIssue[]) ?? [];
  const summary = (args.outputs.summary as string) ?? "";
  const code = (args.inputs.input as string) ?? "";
  const expected = (args.referenceOutputs?.output as string) ?? "";

  // ── Criterion 1: JSON validity (rule-based) ────────────────────────────────
  // If analyzeNode threw, we'd never reach here — so issues being an array is sufficient.
  const jsonValidScore = Array.isArray(issues) ? 1.0 : 0.0;
  const jsonValidComment = Array.isArray(issues)
    ? "Returned a valid structured issues array."
    : "Output was not a valid array.";

  // ── Criteria 2 & 3: Detection accuracy and severity calibration (LLM judge) ─
  const issuesSummary =
    issues.length === 0
      ? "No issues found."
      : issues
          .map(
            (i) =>
              `- [${i.severity}] ${i.category}: ${i.message}`
          )
          .join("\n");

  const judgePrompt = `You are evaluating a code review AI agent. Here is the code it analysed:

\`\`\`
${code}
\`\`\`

Expected outcome: ${expected}

The agent returned this analysis:
Summary: "${summary}"
Issues:
${issuesSummary}

Score TWO criteria and return ONLY valid JSON with no markdown:
{
  "detection_accuracy": <0.0-1.0>,
  "detection_reason": "<one sentence>",
  "severity_calibration": <0.0-1.0>,
  "severity_reason": "<one sentence>"
}

Scoring rubric:
- detection_accuracy: 1.0 if all expected issue types are identified; 0.5 if some are caught; 0.0 if major issues are missed entirely.
- severity_calibration: 1.0 if severity labels are correct (e.g. SQL injection → critical, not info); 0.5 if one is miscalibrated; 0.0 if severely wrong.`;

  const judgeResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: judgePrompt }],
  });

  const raw = (judgeResponse.content[0] as { type: "text"; text: string }).text.trim();
  let scores: Record<string, unknown> = {};
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    scores = JSON.parse(jsonMatch?.[0] ?? "{}") as Record<string, unknown>;
  } catch {
    console.warn("Failed to parse judge JSON:", raw);
  }

  return [
    { key: "json_valid", score: jsonValidScore, comment: jsonValidComment },
    {
      key: "detection_accuracy",
      score: (scores.detection_accuracy as number) ?? 0,
      comment: (scores.detection_reason as string) ?? "",
    },
    {
      key: "severity_calibration",
      score: (scores.severity_calibration as number) ?? 0,
      comment: (scores.severity_reason as string) ?? "",
    },
  ];
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const client = new Client();

  // Upsert dataset
  let dataset: Awaited<ReturnType<typeof client.createDataset>>;
  let found = false;
  for await (const ds of client.listDatasets({ datasetName: DATASET_NAME })) {
    dataset = ds;
    found = true;
    console.log(`Using existing dataset: ${DATASET_NAME} (id: ${ds.id})`);
    break;
  }
  if (!found) {
    dataset = await client.createDataset(DATASET_NAME, {
      description:
        "Evaluation suite for the analyze node — tests issue detection accuracy and severity calibration.",
    });
    console.log(`Created dataset: ${DATASET_NAME} (id: ${dataset!.id})`);
  }

  // Seed missing examples
  const existing: string[] = [];
  for await (const ex of client.listExamples({ datasetId: dataset!.id })) {
    if (ex.inputs?.input) existing.push(ex.inputs.input as string);
  }
  for (const tc of TEST_CASES) {
    if (existing.includes(tc.input)) {
      console.log(`Skipping duplicate: "${tc.input.slice(0, 50).replace(/\n/g, " ")}..."`);
    } else {
      await client.createExample(
        { input: tc.input },
        { output: tc.expected },
        { datasetId: dataset!.id }
      );
      console.log(`Added: "${tc.input.slice(0, 50).replace(/\n/g, " ")}..."`);
    }
  }

  console.log("\nRunning analyze node evaluation...");
  const results = await evaluate(analyzeNodeTarget, {
    data: DATASET_NAME,
    evaluators: [reviewNodeJudge],
    experimentPrefix: "review-node-analyze",
    metadata: { version: "1.0.0", model: "claude-sonnet-4-6" },
  });

  console.log("\n=== Evaluation Complete ===");
  console.log(`Experiment: ${results.experimentName}`);

  for (const r of results.results) {
    console.log(`\nRun: ${r.run.name}`);
    for (const evalResult of r.evaluationResults.results) {
      console.log(
        `  [${evalResult.key}] score=${evalResult.score} — ${evalResult.comment}`
      );
    }
  }
}

main().catch(console.error);
