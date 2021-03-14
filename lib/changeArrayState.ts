import axios from 'axios';
import http from 'http';
import { callSucceeded, callFailed } from './api';
import { authCookies } from './auth';

export async function changeArrayState(action, server, auth, token) {
  try {
    const response = await axios({
      method: 'POST',
      url:
        (server.includes('http') ? server : 'http://' + server) + '/update.htm',
      headers: {
        Authorization: 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: authCookies[ip] ? authCookies[ip] : '',
      },
      data:
        action === 'start'
          ? 'startState=STOPPED&file=&csrf_token=' + token + '&cmdStart=Start'
          : 'startState=STARTED&file=&csrf_token=' + token + '&cmdStop=Stop',
      httpAgent: new http.Agent({ keepAlive: true }),
    });
    callSucceeded(server);
    return response.data;
  } catch (e) {
    console.log('Change Array State for ip: ' + ip + ' Failed');
    if (e.response && e.response.status) {
      callFailed(server, e.response.status);
    } else {
      callFailed(server, 404);
    }
    console.log(e.message);
  }
}
