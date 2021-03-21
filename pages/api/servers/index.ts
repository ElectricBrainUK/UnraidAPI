import { NextApiRequest, NextApiResponse } from 'next';
import { getUnraidDetails } from 'lib/getUnraidDetails';
import { parseServers } from 'lib/storage/servers';
import { getKeyStorage } from 'lib/config';
import { readMqttKeys } from 'lib/storage/secure';

// function getDockerDetails (req: NextApiRequest, res: NextApiResponse) {
//   const
// }

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const keyStorage = getKeyStorage();
  const authHeader = req.headers.authorization;
  const servers = await parseServers();
  const response: Record<string, any> = {
    status: 200,
  };

  if (
    (!authHeader ||
      Object.keys(authHeader).length < Object.keys(servers).length) &&
    keyStorage !== 'config'
  ) {
    Object.keys(servers).forEach((ip) => {
      response[ip] = true;
    });
    res.send({ servers: response });
    return;
  }

  response.servers = servers;

  const loadAuth =
    keyStorage === 'config' && (!authHeader || authHeader.length <= 2);
  const auth = loadAuth ? await readMqttKeys() : JSON.parse(authHeader);

  getUnraidDetails(response.servers, JSON.parse(auth));
  response.status = 200;
  res.send(response);
}
