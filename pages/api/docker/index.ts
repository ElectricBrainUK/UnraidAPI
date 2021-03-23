import { NextApiResponse } from 'next';
import { getCSRFToken } from 'lib/auth';
import { changeDockerState } from 'lib/docker/changeDockerState';
import { ApiBodyRequest } from 'models/api';

interface DockerBody {
  id: string;
  action: string;
  server: string;
  auth: string;
}

export default async function (
  { body }: ApiBodyRequest<DockerBody | undefined>,
  res: NextApiResponse,
): Promise<void> {
  if (body) {
    const { id, server, auth, action } = body;
    const token = await getCSRFToken(server, auth);
    const message = await changeDockerState(id, action, server, auth, token);

    const response = {
      message,
      status: 200,
    };

    res.send(response);
  }
}
