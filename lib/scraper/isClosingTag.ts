export function isClosingTag(remaining: string, open: string): boolean {
  return remaining.indexOf(`</${open}>`) === 0;
}
