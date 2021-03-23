import { NextApiResponse } from 'next';
import { ApiBodyRequest } from 'models/api';
import { getCSRFToken } from 'lib/auth';
import { changeArrayState } from 'lib/changeArrayState';

interface ArrayBody {
  server: string;
  auth: string;
  action: string;
}

export default async function (
  req: ApiBodyRequest<ArrayBody | undefined>,
  res: NextApiResponse,
): Promise<void> {
  if (req.body) {
    const { server, auth, action } = req.body;
    const token = await getCSRFToken(server, auth);
    const message = await changeArrayState(action, server, auth, token);
    const response = {
      status: 200,
      message,
    };
    res.send(response);
  }
}
