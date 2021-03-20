import axios from 'axios';
import http from 'http';
import { callSucceeded, callFailed } from '../api';
import { authCookies } from '../auth';

export async function changeVMState(
  id: string,
  action: string,
  server: string,
  auth: string,
  token: string,
) {
  try {
    const urlBase = server.includes('http') ? server : `http://${server}`;
    const path = '/plugins/dynamix.vm.manager/include/VMajax.php';
    const response = await axios({
      method: 'POST',
      url: urlBase + path,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: authCookies.get(server) ?? '',
      },
      data: `uuid=${id}&action=${action}&csrf_token=${token}`,
      httpAgent: new http.Agent({ keepAlive: true }),
    });

    callSucceeded(server);
    if (response.data.state === 'running') {
      response.data.state = 'started';
    }
    if (response.data.state === 'shutoff') {
      response.data.state = 'stopped';
    }
    return response.data;
  } catch (e) {
    console.log('Change VM State for ip: ' + server + ' Failed');
    if (e.response && e.response.status) {
      callFailed(server, e.response.status);
    } else {
      callFailed(server, 404);
    }
    console.log(e.message);
  }
}
