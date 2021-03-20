import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUnraidDetails } from 'lib/getUnraidDetails';
import { ServerMap } from 'models/server';
import { scrapeHTML, scrapeMainHTML } from 'lib/scraper';
import { parseServers } from 'lib/storage/servers';
import { getKeyStorage } from 'lib/config';
import { readMqttKeys } from 'lib/storage/secure';

// function getDockerDetails (req: NextApiRequest, res: NextApiResponse) {
//   const
// }

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const keyStorage = getKeyStorage();
  const authHeader = req.headers.authorization;
  try {
    const servers = await parseServers();
    if (
      (!authHeader ||
        Object.keys(authHeader).length < Object.keys(servers).length) &&
      keyStorage !== 'config'
    ) {
      let response = {};
      Object.keys(servers).forEach((ip) => {
        response[ip] = true;
      });
      res.send({ servers: response });
      return;
    }
    const response = {
      servers,
      status: 200,
    };
  } catch (e) {
    console.log('Failed to retrieve config file, creating new.');
    // if (!fs.existsSync("config/")){
    //   fs.mkdirSync("config/");
    // }
    // fs.writeFileSync("config/servers.json", JSON.stringify(servers));
  }

  let response = {
    servers: {},
    status: 200,
  };

  const loadAuth =
    keyStorage === 'config' && (!authHeader || authHeader.length <= 2);
  const auth = loadAuth ? await readMqttKeys() : authHeader;
  // if (keyStorage === "config" && (!authHeader || authHeader.length <= 2)) {
  //   const thing = await readMqttKeys()
  //   authHeader = fs.readFileSync((keyStorage + "/" : "secure/") + "mqttKeys");
  // }

  getUnraidDetails(response.servers, JSON.parse(req.headers.authorization));
  response.status = 200;
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
