import { failed } from './failed';

export function callSucceeded(ip: string): void {
  failed.set(ip, 0);
}
