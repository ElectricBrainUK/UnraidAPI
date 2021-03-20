import axios from 'axios';
import { ServerMap } from 'models/server';
import { callSucceeded, callFailed } from '../api';
import { authCookies } from '../auth';
import { extractValue } from '../scraper';
import { updateFile } from '../storage/updateFile';

export function getUSBDetails(
  servers: ServerMap,
  serverAuth: Record<string, string>,
) {
  Object.keys(servers).forEach((ip) => {
    if (!serverAuth[ip]) {
      return;
    }
    if (
      servers[ip].vm &&
      servers[ip].vm.details &&
      Object.keys(servers[ip].vm.details).length > 0
    ) {
      const urlBase = ip.includes('http') ? ip : `http://${ip}`;
      const basePath = '/VMs/UpdateVM?uuid=';
      axios({
        method: 'get',
        url:
          urlBase +
          basePath +
          servers[ip].vm.details[Object.keys(servers[ip].vm.details)[0]].id,
        headers: {
          Authorization: `Basic ${serverAuth[ip]}`,
          Cookie: authCookies.get(ip) ?? '',
        },
      })
        .then((response) => {
          callSucceeded(ip);
          updateFile(servers, ip, 'status');

          servers[ip].usbDetails = [];
          while (response.data.toString().includes('<label for="usb')) {
            let row = extractValue(
              response.data,
              '<label for="usb',
              '</label>',
            );
            servers[ip].usbDetails.push({
              id: extractValue(row, 'value="', '"'),
              name: extractValue(row, '/> ', ' ('),
            });
            response.data = response.data.replace('<label for="usb', '');
          }
          updateFile(servers, ip, 'usbDetails');
        })
        .catch((e) => {
          console.log('Get USB Details for ip: ' + ip + ' Failed');
          if (e.response && e.response.status) {
            callFailed(ip, e.response.status);
          } else {
            callFailed(ip, 404);
          }
          console.log(e.message);
          if (e.message.includes('ETIMEDOUT')) {
            updateFile(servers, ip, 'status');
          }
        });
    }
  });
}
