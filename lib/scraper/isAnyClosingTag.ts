export function isAnyClosingTag(remaining?: string): boolean {
  return remaining && remaining.indexOf('</') === 0;
}
