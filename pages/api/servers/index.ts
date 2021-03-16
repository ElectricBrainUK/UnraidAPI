import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUnraidDetails } from 'lib/getUnraidDetails';

export default function (req: NextApiRequest, res: NextApiResponse) {
  let servers = {};
  try {
    servers = JSON.parse(fs.readFileSync('config/servers.json').toString());
  } catch (e) {
    console.log('Failed to retrieve config file, creating new.');
    if (!fs.existsSync('config/')) {
      fs.mkdirSync('config/');
    }
    fs.writeFileSync('config/servers.json', JSON.stringify(servers));
  }
  if (
    (!req.headers.authorization ||
      Object.keys(req.headers.authorization).length <
        Object.keys(servers).length) &&
    process.env.KeyStorage !== 'config'
  ) {
    let response = {};
    Object.keys(servers).forEach((ip) => {
      response[ip] = true;
    });
    res.send({ servers: response });
    return;
  }
  let response = {
    servers,
    status: 401,
  };

  if (
    process.env.KeyStorage === 'config' &&
    (!req.headers.authorization || req.headers.authorization.length <= 2)
  ) {
    req.headers.authorization = fs
      .readFileSync(
        (process.env.KeyStorage ? process.env.KeyStorage + '/' : 'secure/') +
          'mqttKeys',
      )
      .toString();
  }

  getUnraidDetails(response.servers, JSON.parse(req.headers.authorization));
  response.status = 200;
  res.send(response);
}
