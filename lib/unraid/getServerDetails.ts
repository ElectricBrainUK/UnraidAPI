import { updateFile } from '../updateFile';
import { scrapeMainHTML } from '../scrapeMainHTML';
import { scrapeHTML } from '../scrapeHTML';

export function getServerDetails(servers, serverAuth) {
  Object.keys(servers).forEach(async (ip) => {
    if (servers[ip].serverDetails === undefined) {
      servers[ip].serverDetails = {};
    }

    if (!serverAuth[ip]) {
      servers[ip].serverDetails.on = false;
      return;
    }

    servers[ip].serverDetails =
      (await scrapeHTML(ip, serverAuth)) || servers[ip].serverDetails;
    servers[ip].serverDetails =
      {
        ...(await scrapeMainHTML(ip, serverAuth)),
        ...servers[ip].serverDetails,
      } || servers[ip].serverDetails;

    servers[ip].serverDetails.on = servers[ip].status === 'online';

    updateFile(servers, ip, 'serverDetails');
  });
}
