import axios from 'axios';
import { callSucceeded, callFailed } from '../api';
import { authCookies } from '../auth';
import { parseHTML } from '../scraper';
import { updateFile } from '../storage/updateFile';
import { processVMResponse } from './processVMResponse';

export function getVMs(servers, serverAuth) {
  Object.keys(servers).forEach((ip) => {
    if (!serverAuth[ip]) {
      return;
    }
    axios({
      method: 'get',
      url:
        (ip.includes('http') ? ip : 'http://' + ip) +
        '/plugins/dynamix.vm.manager/include/VMMachines.php',
      headers: {
        Authorization: 'Basic ' + serverAuth[ip],
        Cookie: authCookies[ip] ? authCookies[ip] : '',
      },
    })
      .then(async (response) => {
        callSucceeded(ip);
        servers[ip].vm = {};
        let htmlDetails;
        if (response.data.toString().includes('\u0000')) {
          let parts = response.data.toString().split('\u0000');
          htmlDetails = JSON.stringify(parts[0]);

          servers[ip].vm.extras = parts[1];
        } else {
          htmlDetails = response.data.toString();
        }

        let details = parseHTML(htmlDetails);
        servers[ip].vm.details = await processVMResponse(
          details,
          ip,
          serverAuth[ip],
        );
        updateFile(servers, ip, 'vm');
      })
      .catch((e) => {
        console.log('Get VM Details for ip: ' + ip + ' Failed');
        if (e.response && e.response.status) {
          callFailed(ip, e.response.status);
        } else {
          callFailed(ip, 404);
        }
        console.log(e.message);
      });
  });
}
