/**
 * Extracts and parses a JSON object from a Claude response string.
 *
 * Claude occasionally wraps its JSON in markdown fences or prepends prose
 * before the JSON object despite being told not to. This utility handles
 * both cases:
 *   1. Strips leading/trailing markdown fences and attempts JSON.parse.
 *   2. If that fails, locates the JSON object by scanning for the first
 *      occurrence of a known top-level key and parses from that position.
 *
 * @param raw      - Raw response text from the Claude API.
 * @param rootKey  - A key expected at the top level of the JSON object
 *                   (used to locate the object when prose precedes it).
 */
export function extractJson<T>(raw: string, rootKey: string): T {
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    const marker = `{"${rootKey}"`;
    const jsonStart = raw.lastIndexOf(marker);
    if (jsonStart !== -1) {
      try {
        return JSON.parse(raw.slice(jsonStart)) as T;
      } catch {
        // fall through to throw
      }
    }
    throw new Error(`Could not extract valid JSON from agent response: ${raw.slice(0, 300)}`);
  }
}
