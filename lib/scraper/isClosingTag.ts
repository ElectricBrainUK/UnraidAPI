export function isClosingTag(remaining, open) {
  return remaining.indexOf(`</${open}>`) === 0;
}
