export function extractValue(data: string, value: string, terminator: string) {
  let start = data.substring(data.toString().indexOf(value) + value.length);
  return start.substring(0, start.indexOf(terminator));
}
