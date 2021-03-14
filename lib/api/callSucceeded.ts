import { failed } from './failed';

export function callSucceeded(ip: string) {
  failed.set(ip, 0);
}
