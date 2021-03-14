export function isAnyClosingTag(remaining: string) {
  return remaining && remaining.indexOf('</') === 0;
}
