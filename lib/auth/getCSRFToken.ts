import axios from 'axios';
import { authCookies } from './authCookies';
import { callSucceeded, callFailed } from '../api';
import { extractValue } from '../scraper';

export async function getCSRFToken(server: string, auth: string) {
  try {
    const response = await axios({
      method: 'get',
      url:
        (server.includes('http') ? server : 'http://' + server) + '/Dashboard',
      headers: {
        Authorization: 'Basic ' + auth,
        Cookie: authCookies[server] ? authCookies[server] : '',
      },
    });
    callSucceeded(server);
    return extractValue(response.data, 'csrf_token=', "'");
  } catch (e) {
    console.log('Get CSRF Token for server: ' + server + ' Failed');
    if (e.response && e.response.status) {
      callFailed(server, e.response.status);
    } else {
      callFailed(server, 404);
    }
    console.log(e.message);
  }
}
