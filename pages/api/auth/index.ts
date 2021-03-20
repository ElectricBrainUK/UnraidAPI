import { NextApiResponse } from 'next';
import { ApiBodyRequest, LoginBody } from 'models/api/';
import { parseServers, writeServersJson } from 'lib/storage/servers';
import { keyStorageChecker, writeMqttKeys } from 'lib/storage/secure';

export default async function (
  req: ApiBodyRequest<LoginBody>,
  res: NextApiResponse,
) {
  const response = await connectToServer(req.body);
  res.send(response);
}

async function connectToServer({ ip, user, password }: LoginBody) {
  let response = { message: '' };

  try {
    const [servers, keys] = await Promise.all([
      parseServers(),
      keyStorageChecker(),
    ]);

    if (!ip.length) {
      return response;
    }

    // TODO this has changed such that, if the server already exists from the
    // file that has been read in, it does not overwrite the entry. Is that
    // desired behaviour?
    const serverExists = servers[ip] !== undefined;
    servers[ip] = serverExists ? servers[ip] : {};

    const authToken = Buffer.from(`${user}:${password}`).toString();
    keys[ip] = authToken;

    await Promise.all([writeMqttKeys(keys), writeServersJson(servers)]);

    response.message = 'Connected';
  } catch (err) {
    console.error(err);
  }
  return response;
}
