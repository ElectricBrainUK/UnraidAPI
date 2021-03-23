import { NextApiResponse } from 'next';
import { getCSRFToken } from 'lib/auth';
import { ApiBodyRequest } from 'models/api';
import { changeServerState, Action } from 'lib/changeServerState';

interface ServerStatusBody {
  action: Action;
  server: string;
  auth: string;
}

export default async function (
  { body }: ApiBodyRequest<ServerStatusBody>,
  res: NextApiResponse,
): Promise<void> {
  if (body) {
    const { server, auth, action } = body;
    const token = await getCSRFToken(server, auth);
    const message = await changeServerState(action, server, auth, token);
    const response = { status: 200, message };
    res.send(response);
  }
}
