import axios from 'axios';
import http from 'http';
import { callFailed } from './callFailed';
import { callSucceeded } from './callSucceeded';
import { buildForm } from './buildForm';
import { authCookies } from '../auth';
import { VmEdit } from 'models/vm';

export async function requestChange(
  ip: string,
  id: string,
  auth: string,
  vmObject: VmEdit | undefined,
  create: boolean,
): Promise<any> {
  const urlBase = ip.includes('http') ? ip : `http://${ip}`;
  return axios({
    method: 'POST',
    url: `${urlBase}/plugins/dynamix.vm.manager/templates/Custom.form.php`,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      Cookie: authCookies.get(ip) ?? '',
    },
    data: await buildForm(ip, auth, id, vmObject, create),
    httpAgent: new http.Agent({ keepAlive: true }),
  })
    .then((response) => {
      callSucceeded(ip);
      return response.data;
    })
    .catch((e) => {
      console.log('Make Edit for ip: ' + ip + ' Failed');
      if (e.response && e.response.status) {
        callFailed(ip, e.response.status);
      } else {
        callFailed(ip, 404);
      }
      console.log(e.message);
    });
}
