import axios from 'axios';
import { extractDiskDetails } from './extractDiskDetails';
import { authCookies } from '../auth';
import { extractValue } from './extractValue';
import { extractReverseValue } from './extractReverseValue';
import { callFailed, callSucceeded } from '../api';

interface ServerCoreDetails {
  title: string;
  cpu: string;
  memory: string;
  motherboard: string;
  diskSpace: string;
  cacheSpace: string;
  version: string;
}

export async function scrapeHTML(
  ip: string,
  serverAuth,
): Promise<ServerCoreDetails | undefined> {
  try {
    const response = await axios({
      method: 'get',
      url: (ip.includes('http') ? ip : 'http://' + ip) + '/Dashboard',
      headers: {
        Authorization: 'Basic ' + serverAuth[ip],
        Cookie: authCookies[ip] ? authCookies[ip] : '',
      },
    });
    callSucceeded(ip);
    let details = {
      title: extractValue(response.data, 'title>', '/'),
      cpu: extractReverseValue(
        extractValue(response.data, "cpu_view'>", '</tr'),
        '<br>',
        '>',
      ),
      memory: extractValue(response.data, 'Memory<br><span>', '<'),
      motherboard: extractValue(
        response.data,
        "<tr class='mb_view'><td></td><td colspan='3'>",
        '<',
      ),
      diskSpace: extractValue(
        extractValue(response.data, 'Go to disk settings', '/span>'),
        "<span class='info'>",
        '<',
      ),
      cacheSpace: extractValue(
        extractValue(response.data, 'Go to cache settings', '/span>'),
        "<span class='info'>",
        '<',
      ),
      version: extractValue(response.data, 'Version: ', '&nbsp;'),
    };

    extractDiskDetails(details, 'diskSpace', 'array');
    extractDiskDetails(details, 'cacheSpace', 'cache');
    return details;
  } catch (e) {
    console.log(
      'Get Dashboard Details for ip: ' +
        ip +
        ' Failed with status code: ' +
        e.response,
    );
    if (e.response && e.response.status) {
      callFailed(ip, e.response.status);
    } else {
      callFailed(ip, 404);
    }
    console.log(e.message);
  }
}
