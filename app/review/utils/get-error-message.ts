import { isAxiosError } from "axios";

/**
 * Extracts a human-readable message from an unknown error value.
 * Prefers the server-supplied `error` field from axios response data.
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const serverMessage = (error.response?.data as { error?: string })?.error;
    return serverMessage ?? error.message ?? "An unexpected error occurred.";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
