/** Tallies the per-subject copies of an export from their `Promise.allSettled` results. */
export function countExportResults(results: readonly PromiseSettledResult<unknown>[]): {
  succeeded: number;
  failed: number;
  total: number;
} {
  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  return { succeeded, failed: results.length - succeeded, total: results.length };
}
