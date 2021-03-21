export function clean(value?: string): string | undefined {
  return value?.replace(/'/g, '');
}
