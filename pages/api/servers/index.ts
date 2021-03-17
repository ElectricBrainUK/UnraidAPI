import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUnraidDetails } from 'lib/getUnraidDetails';
import { ServerMap } from 'models/server';
import { scrapeHTML, scrapeMainHTML } from 'lib/scraper';

// function getDockerDetails (req: NextApiRequest, res: NextApiResponse) {
//   const
// }

export default function (req: NextApiRequest, res: NextApiResponse) {
  let servers: ServerMap = {};
  try {
    servers = JSON.parse(fs.readFileSync('config/servers.json').toString());
  } catch (e) {
    console.log('Failed to retrieve config file, creating new.');
    if (!fs.existsSync('config/')) {
      fs.mkdirSync('config/');
    }
    fs.writeFileSync('config/servers.json', JSON.stringify(servers));
  }
  // if (
  //   (!req.headers.authorization ||
  //     Object.keys(req.headers.authorization).length <
  //       Object.keys(servers).length) &&
  //   process.env.KeyStorage !== 'config'
  // ) {
  //   let response = {};
  //   Object.keys(servers).forEach((ip) => {
  //     response[ip] = true;
  //   });
  //   res.send({ servers: response });
  //   return;
  // }
  let response = {
    servers,
    status: 401,
    details: [],
  };

  if (
    // process.env.KeyStorage === 'config' &&
    !req.headers.authorization ||
    req.headers.authorization.length <= 2
  ) {
    req.headers.authorization = fs
      .readFileSync(
        (process.env.KeyStorage ? process.env.KeyStorage + '/' : 'secure/') +
          'mqttKeys',
      )
      .toString();
  }
  console.log(req.headers.authorization);
  const details = getServerDetails(
    response.servers,
    JSON.parse(req.headers.authorization),
  );
  // getUnraidDetails(response.servers, JSON.parse(req.headers.authorization));
  response.status = 200;
  response.details = details;
  res.send(response);
}

export function getServerDetails(servers: ServerMap, serverAuth) {
  const data = [];
  console.log(serverAuth);
  Object.keys(servers).forEach(async (ip) => {
    if (!serverAuth[ip]) {
      servers[ip].serverDetails.on = false;
      return;
    }

    const scrapedDetails = await scrapeHTML(ip, serverAuth);
    const scrapedMainDetails = await scrapeMainHTML(ip, serverAuth);
    data.push(scrapedMainDetails);
    console.log(scrapedMainDetails);
    const details = {
      ...scrapedDetails,
      ...scrapedMainDetails,
    };
    servers[ip].serverDetails = {
      ...servers[ip].serverDetails,
      ...details,
    };

    servers[ip].serverDetails.on = servers[ip].status === 'online';

    // updateFile(servers, ip, 'serverDetails');
  });
  return data;
}
