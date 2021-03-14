export function hasContents(remaining: string) {
  return remaining.indexOf('</') !== 0 && remaining.indexOf('<') !== 0;
}
