/**
 * Levenshtein distance and close-match utilities for input forgiveness.
 */

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }
  return dp[m]![n]!;
}

/**
 * Normalise a string for fuzzy comparison: trim, lowercase, strip
 * punctuation, collapse spaces, straighten quotes.
 */
function normFuzzy(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201C\u201D]/g, "'")
    .replace(/[.,!?;:¿¡"']+/g, '')
    .replace(/\s+/g, ' ');
}

export function isCloseMatch(
  userText: string,
  accepted: string[],
  maxDist = 2
): { close: boolean; bestMatch: string | null } {
  const u = normFuzzy(userText);
  let bestDist = Infinity;
  let bestMatch: string | null = null;

  for (const ans of accepted) {
    const a = normFuzzy(ans);
    const dist = levenshtein(u, a);
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = ans;
    }
  }

  return {
    close: bestDist > 0 && bestDist <= maxDist,
    bestMatch: bestDist <= maxDist ? bestMatch : null,
  };
}
