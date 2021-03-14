import { extractValue } from './extractValue';

export function extractReverseValue(
  data: string,
  value: string,
  terminator: string,
) {
  return extractValue(
    data.split('').reverse().join(''),
    value.split('').reverse().join(''),
    terminator.split('').reverse().join(''),
  )
    .split('')
    .reverse()
    .join('');
}
