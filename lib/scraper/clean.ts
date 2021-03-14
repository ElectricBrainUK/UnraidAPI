export function clean(value?: string) {
  return value?.replace(/\'/g, '');
}
