// .claude/skills/extract-hook/examples/ideal-hook-pattern.ts
'use client'; // Required for client-side TanStack context tracking

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api'; // Always reuse our central api abstraction layer

export interface UserProfilePayload {
  id: string;
  username: string;
  email: string;
}

/**
 * Core asynchronous fetcher function utilizing strict async/await syntax.
 */
async function fetchUserProfile(userId: string): Promise<UserProfilePayload> {
  // Always let the centralized api wrapper return response.data directly
  return api.get<UserProfilePayload>(`/users/${userId}`);
}

/**
 * Production standard custom hook wrapper for UI consumption.
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['user-profile', userId], // Explicit dependency arrays prevent memory drift
    queryFn: () => fetchUserProfile(userId),
    enabled: Boolean(userId), // Guard clause prevents immediate accidental null fetches
  });
}
