import { authCookies } from '../auth';
import { failed } from './failed';

export function callFailed(ip: string, status: number): void {
  if (!failed.has(ip)) {
    failed.set(ip, 1);
  } else {
    const current = failed.get(ip);
    failed.set(ip, current + 1);
  }

  let threshold = 2;
  if (status === 503) {
    threshold = 5;
  }

  const current = failed.get(ip);

  if (current > threshold) {
    failed.set(ip, 0);
    authCookies.delete(ip);
  }
}
