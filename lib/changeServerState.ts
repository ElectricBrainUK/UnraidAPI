import axios from 'axios';
import http from 'http';
import { authCookies } from './Unraid';

export function changeServerState(action, server, auth, token) {
  switch (action) {
    case 'shutdown':
      return axios({
        method: 'POST',
        url:
          (server.includes('http') ? server : 'http://' + server) +
          '/webGui/include/Boot.php',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: authCookies[server] ? authCookies[server] : '',
        },
        data: 'csrf_token=' + token + '&cmd=shutdown',
        httpAgent: new http.Agent({ keepAlive: true }),
      })
        .then(() => {
          return { success: true };
        })
        .catch((e) => {
          console.log(e);
          return { success: false };
        });
    case 'reboot':
      return axios({
        method: 'POST',
        url:
          (server.includes('http') ? server : 'http://' + server) +
          '/webGui/include/Boot.php',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: authCookies[server] ? authCookies[server] : '',
        },
        data: 'csrf_token=' + token + '&cmd=reboot',
        httpAgent: new http.Agent({ keepAlive: true }),
      })
        .then(() => {
          return { success: true };
        })
        .catch((e) => {
          console.log(e);
          return { success: false };
        });
    case 'move':
      return axios({
        method: 'POST',
        url:
          (server.includes('http') ? server : 'http://' + server) +
          '/update.htm',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: authCookies[server] ? authCookies[server] : '',
        },
        data: 'cmdStartMover=Move&csrf_token=' + token,
        httpAgent: new http.Agent({ keepAlive: true }),
      })
        .then(() => {
          return { success: true };
        })
        .catch((e) => {
          console.log(e);
          return { success: false };
        });
    case 'check':
      return axios({
        method: 'POST',
        url:
          (server.includes('http') ? server : 'http://' + server) +
          '/update.htm',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: authCookies[server] ? authCookies[server] : '',
        },
        data:
          'startState=STARTED&file=&cmdCheck=Check&optionCorrect=correct&csrf_token=' +
          token,
        httpAgent: new http.Agent({ keepAlive: true }),
      })
        .then(() => {
          return { success: true };
        })
        .catch((e) => {
          console.log(e);
          return { success: false };
        });
    case 'check-cancel':
      return axios({
        method: 'POST',
        url:
          (server.includes('http') ? server : 'http://' + server) +
          '/update.htm',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: authCookies[server] ? authCookies[server] : '',
        },
        data:
          'startState=STARTED&file=&csrf_token=' + token + '&cmdNoCheck=Cancel',
        httpAgent: new http.Agent({ keepAlive: true }),
      })
        .then(() => {
          return { success: true };
        })
        .catch((e) => {
          console.log(e);
          return { success: false };
        });
    case 'sleep':
      return axios({
        method: 'GET',
        url:
          (server.includes('http') ? server : 'http://' + server) +
          '/plugins/dynamix.s3.sleep/include/SleepMode.php',
        headers: {
          Authorization: 'Basic ' + auth,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Cookie: authCookies[server] ? authCookies[server] : '',
        },
      })
        .then(() => {
          return { success: true };
        })
        .catch((e) => {
          console.log(e);
          return { success: false };
        });
    default:
      console.log(
        'Looks like you tried to change the server state but without describing how.',
      );
  }
}
