export function isRemaining(remaining?: string): boolean {
  return remaining && remaining.indexOf('<') >= 0;
}
