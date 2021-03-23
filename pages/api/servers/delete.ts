import { parseServers, writeServersJson } from 'lib/storage/servers';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  for (let i = 0; i < 180; i++) {
    setTimeout(() => {
      deleteIP(req.body);
    }, 1000 * i);
  }

  res.send({ status: 200 });
}

async function deleteIP(ip: string) {
  const servers = await parseServers();
  servers[ip] = undefined;
  await writeServersJson(servers);
}
