import { ServerMap } from 'models/server';
import { scrapeHTML, scrapeMainHTML } from '../scraper';
import { updateFile } from '../storage/updateFile';

export function getServerDetails(
  servers: ServerMap,
  serverAuth: Record<string, string>,
) {
  Object.keys(servers).forEach(async (ip) => {
    if (!serverAuth[ip]) {
      servers[ip].serverDetails.on = false;
      return;
    }

    const scrapedDetails = await scrapeHTML(ip, serverAuth);
    const scrapedMainDetails = await scrapeMainHTML(ip, serverAuth);

    const details = {
      ...scrapedDetails,
      ...scrapedMainDetails,
    };
    servers[ip].serverDetails = {
      ...servers[ip].serverDetails,
      ...details,
    };

    servers[ip].serverDetails.on = servers[ip].status === 'online';

    updateFile(servers, ip, 'serverDetails');
  });
}
