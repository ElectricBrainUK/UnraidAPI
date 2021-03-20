import axios from 'axios';
import http from 'http';
import { authCookies } from './auth';

type Action =
  | 'shutdown'
  | 'reboot'
  | 'move'
  | 'check'
  | 'check-cancel'
  | 'sleep';

export async function changeServerState(
  action: Action,
  server: string,
  auth: string,
  token: string,
) {
  const urlBase = server.includes('http') ? server : `http://${server}`;

  const cookie = authCookies.get(server) ?? '';

  const headers = {
    Authorization: `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: cookie,
  };

  switch (action) {
    case 'shutdown':
      try {
        await axios({
          method: 'POST',
          url: `${urlBase}/webGui/include/Boot.php`,
          headers,
          data: `csrf_token=${token}&cmd=shutdown`,
          httpAgent: new http.Agent({ keepAlive: true }),
        });
        return { success: true };
      } catch (e) {
        console.log(e);
        return { success: false };
      }
    case 'reboot':
      try {
        await axios({
          method: 'POST',
          url: `${urlBase}/webGui/include/Boot.php`,
          headers,
          data: `csrf_token=${token}&cmd=reboot`,
          httpAgent: new http.Agent({ keepAlive: true }),
        });
        return { success: true };
      } catch (e_1) {
        console.log(e_1);
        return { success: false };
      }
    case 'move':
      try {
        await axios({
          method: 'POST',
          url: `${urlBase}/update.htm`,
          headers,
          data: `cmdStartMover=Move&csrf_token=${token}`,
          httpAgent: new http.Agent({ keepAlive: true }),
        });
        return { success: true };
      } catch (e_2) {
        console.log(e_2);
        return { success: false };
      }
    case 'check':
      try {
        await axios({
          method: 'POST',
          url: `${urlBase}/update.htm`,
          headers,
          data: `startState=STARTED&file=&cmdCheck=Check&optionCorrect=correct&csrf_token=${token}`,
          httpAgent: new http.Agent({ keepAlive: true }),
        });
        return { success: true };
      } catch (e_3) {
        console.log(e_3);
        return { success: false };
      }
    case 'check-cancel':
      try {
        await axios({
          method: 'POST',
          url: `${urlBase}/update.htm`,
          headers,
          data: `startState=STARTED&file=&csrf_token=${token}&cmdNoCheck=Cancel`,
          httpAgent: new http.Agent({ keepAlive: true }),
        });
        return { success: true };
      } catch (e_4) {
        console.log(e_4);
        return { success: false };
      }
    case 'sleep':
      try {
        await axios({
          method: 'GET',
          url: `${urlBase}/plugins/dynamix.s3.sleep/include/SleepMode.php`,
          headers,
        });
        return { success: true };
      } catch (e_5) {
        console.log(e_5);
        return { success: false };
      }
    default:
      console.log(
        'Looks like you tried to change the server state but without describing how.',
      );
  }
}
