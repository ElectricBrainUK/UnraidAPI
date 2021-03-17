import { ServerMap } from 'models/server';
import { updateFile } from '../storage/updateFile';

export function getPCIDetails(servers: ServerMap, skipSave = false) {
  Object.keys(servers).forEach((ip) => {
    if (
      servers[ip].vm &&
      servers[ip].vm.details &&
      Object.keys(servers[ip].vm.details).length > 0 &&
      servers[ip].vm.details[Object.keys(servers[ip].vm.details)[0]].edit
    ) {
      servers[ip].pciDetails =
        servers[ip].vm.details[
          Object.keys(servers[ip].vm.details)[0]
        ].edit.pcis;
    }
    if (!skipSave) {
      updateFile(servers, ip, 'pciDetails');
    }
  });
}
