import axios from 'axios';
import http from 'http';
import { callSucceeded, callFailed } from './api';
import { authCookies } from './auth';

export async function changeArrayState(
  action: string,
  server: string,
  auth: string,
  token: string,
) {
  try {
    const baseUrl = server.includes('http') ? server : 'http://' + server;
    const cookie = authCookies.get(server) ?? '';
    const _action =
      action === 'start'
        ? `startState=STOPPED&file=&csrf_token=${token}&cmdStart=Start`
        : `startState=STARTED&file=&csrf_token=${token}&cmdStop=Stop`;

    const response = await axios({
      method: 'POST',
      url: `${baseUrl}/update.htm`,
      headers: {
        Authorization: `Basic ${auth}`,
        Cookie: cookie,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      data: _action,
      httpAgent: new http.Agent({ keepAlive: true }),
    });
    callSucceeded(server);
    return response.data;
  } catch (e) {
    console.log(`Change Array State for ip: ${server} Failed`);
    if (e.response && e.response.status) {
      callFailed(server, e.response.status);
    } else {
      callFailed(server, 404);
    }
    console.log(e.message);
  }
}
