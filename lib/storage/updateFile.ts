import fs from 'fs';
import { ServerMap } from '../unraid/types';

export function updateFile(servers: ServerMap, ip: string, tag) {
  let oldServers = {};

  try {
    let rawdata = fs.readFileSync('config/servers.json').toString();
    oldServers = JSON.parse(rawdata);
  } catch (e) {
    console.log(e);
  } finally {
    if (!oldServers[ip]) {
      oldServers[ip] = {};
    }
    oldServers[ip][tag] = servers[ip][tag];
    fs.writeFileSync('config/servers.json', JSON.stringify(oldServers));
  }
}
