import axios from 'axios';
import { callSucceeded, callFailed } from '../api';
import { authCookies } from '../auth';
import { parseHTML } from '../scraper';
import { updateFile } from '../storage/updateFile';
import { ServerMap } from '../unraid/types';
import { processDockerResponse } from './processDockerResponse';

export function getDockers(servers: ServerMap, serverAuth) {
  Object.keys(servers).forEach((ip) => {
    if (!serverAuth[ip]) {
      return;
    }
    axios({
      method: 'get',
      url:
        (ip.includes('http') ? ip : 'http://' + ip) +
        '/plugins/dynamix.docker.manager/include/DockerContainers.php',
      headers: {
        Authorization: 'Basic ' + serverAuth[ip],
        Cookie: authCookies[ip] ? authCookies[ip] : '',
      },
    })
      .then(async (response) => {
        callSucceeded(ip);
        let htmlDetails = JSON.stringify(response.data);
        let details = parseHTML(htmlDetails);
        servers[ip].docker.details = processDockerResponse(details);
        updateFile(servers, ip, 'docker');
      })
      .catch((e) => {
        console.log('Get Docker Details for ip: ' + ip + ' Failed');
        if (e.response && e.response.status) {
          callFailed(ip, e.response.status);
        } else {
          callFailed(ip, 404);
        }
        console.log(e.message);
      });
  });
}
