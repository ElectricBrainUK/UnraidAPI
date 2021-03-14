import FormData from 'form-data';
import { authCookies } from '../Unraid';
import { logInToUrl } from '../logInToUrl';
import { ServerMap } from './types';

export async function logIn(servers: ServerMap, serverAuth) {
  const ips = Object.keys(servers);
  const promises = ips.map((ip) => {
    if (!serverAuth[ip] || (authCookies[ip] && authCookies[ip] !== undefined)) {
      if (!serverAuth[ip]) {
        servers[ip].status = 'offline';
      } else {
        servers[ip].status = 'online';
      }
      return;
    }

    servers[ip].status = 'offline';

    const details = Buffer.from(serverAuth[ip], 'base64').toString('ascii');

    const data = new FormData();
    data.append('username', details.substring(0, details.indexOf(':')));
    data.append('password', details.substring(details.indexOf(':') + 1));

    return logInToUrl(
      (ip.includes('http') ? ip : 'http://' + ip) + '/login',
      data,
      ip,
    );
  });

  return await Promise.all(promises);
}
