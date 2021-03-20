import fs from 'fs';
import { ServerMap } from 'models/server';

export function updateFile(servers: ServerMap, ip: string, tag: string) {
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
