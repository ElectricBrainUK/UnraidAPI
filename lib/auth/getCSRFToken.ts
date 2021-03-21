import axios from 'axios';
import { authCookies } from './authCookies';
import { callSucceeded, callFailed } from '../api';
import { extractValue } from '../scraper';

export async function getCSRFToken(server: string, auth: string) {
  try {
    const baseUrl = server.includes('http') ? server : `http://${server}`;
    const cookie = authCookies.get(server) ?? '';

    const response = await axios({
      method: 'GET',
      url: `${baseUrl}/Dashboard`,
      headers: {
        Authorization: `Basic ${auth}`,
        Cookie: cookie,
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
