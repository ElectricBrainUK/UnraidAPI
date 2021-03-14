export function hasChildren(remaining: string) {
  return remaining.indexOf('<') === 0 && remaining.indexOf('</') !== 0;
}
