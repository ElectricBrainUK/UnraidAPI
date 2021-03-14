import axios from 'axios';
import fs from 'fs';
import { callSucceeded, callFailed } from '../api';
import { authCookies } from '../auth';
import { extractVMDetails } from '../scraper/extractVMDetails';

export async function gatherDetailsFromEditVM(ip: string, id, vmObject, auth) {
  let rawdata = fs.readFileSync('config/servers.json').toString();
  let servers = JSON.parse(rawdata);
  if (!vmObject) {
    vmObject = servers[ip].vm.details[id];
  }
  try {
    const response = await axios({
      method: 'get',
      url:
        (ip.includes('http') ? ip : 'http://' + ip) +
        '/VMs/UpdateVM?uuid=' +
        id,
      headers: {
        Authorization: 'Basic ' + auth,
        Cookie: authCookies[ip] ? authCookies[ip] : '',
      },
    });
    callSucceeded(ip);
    return extractVMDetails(vmObject, response, ip);
  } catch (e) {
    console.log('Get VM Edit details for ip: ' + ip + ' Failed');
    if (e.response && e.response.status) {
      callFailed(ip, e.response.status);
    } else {
      callFailed(ip, 404);
    }
    console.log(e.message);
    vmObject.edit = servers[ip].vm.details[id].edit;
    return vmObject;
  }
}
