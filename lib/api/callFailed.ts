import { authCookies } from '../auth';
import { failed } from './failed';

export function callFailed(ip: string, status: number) {
  if (!failed[ip]) {
    failed[ip] = 1;
  } else {
    failed[ip]++;
  }

  let threshold = 2;
  if (status === 503) {
    threshold = 5;
  }

  if (failed[ip] > threshold) {
    failed[ip] = 0;
    authCookies[ip] = undefined;
  }
}
