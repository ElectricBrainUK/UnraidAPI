import axios from 'axios';
import { extractValue } from './extractValue';
import { extractReverseValue } from './extractReverseValue';
import { callSucceeded, callFailed } from '../api';
import { authCookies } from '../auth';

interface ServerMainDetails {
  arrayStatus: string;
  arrayProtection: string;
  moverRunning: boolean;
  parityCheckRunning: boolean;
}

export async function scrapeMainHTML(
  ip: string,
  serverAuth,
): Promise<ServerMainDetails | undefined> {
  try {
    const response = await axios({
      method: 'get',
      url: (ip.includes('http') ? ip : 'http://' + ip) + '/Main',
      headers: {
        Authorization: 'Basic ' + serverAuth[ip],
        Cookie: authCookies[ip] ? authCookies[ip] : '',
      },
    });
    callSucceeded(ip);
    let protection = extractValue(
      response.data,
      '</td></tr>\n          <tr><td>',
      '</td><td>',
    );
    return {
      arrayStatus: extractReverseValue(
        extractValue(response.data, '<table class="array_status">', '/span>'),
        '<',
        '>',
      ).split(',')[0],
      arrayProtection: protection.includes('>') ? undefined : protection,
      moverRunning: response.data.includes('Disabled - Mover is running.'),
      parityCheckRunning: response.data.includes('Parity-Check in progress.'),
    };
  } catch (e) {
    console.log('Get Main Details for ip: ' + ip + ' Failed');
    if (e.response && e.response.status) {
      callFailed(ip, e.response.status);
    } else {
      callFailed(ip, 404);
    }
    console.log(e.message);
  }
}
