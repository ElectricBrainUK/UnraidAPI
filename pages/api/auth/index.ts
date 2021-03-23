import { NextApiResponse } from 'next';
import { ApiBodyRequest, LoginBody } from 'models/api/';
import { parseServers, writeServersJson } from 'lib/storage/servers';
import { keyStorageChecker, writeMqttKeys } from 'lib/storage/secure';

export default async function (
  req: ApiBodyRequest<LoginBody>,
  res: NextApiResponse,
) {
  const response = await storeServerDetails(req.body);
  res.send(response);
}

async function storeServerDetails({ ip, user, password }: LoginBody) {
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
    // TODO I think this just makes sure that an empty object exists instead of null but let me know if you think its redundant
    const serverExists = servers[ip] !== undefined;
    servers[ip] = serverExists ? servers[ip] : {};

    const authToken = Buffer.from(`${user}:${password}`).toString("base64");
    keys[ip] = authToken;

    await Promise.all([writeMqttKeys(keys), writeServersJson(servers)]);

    response.message = 'Connected';
  } catch (err) {
    console.error(err);
  }
  return response;
}
