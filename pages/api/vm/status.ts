import { NextApiResponse } from 'next';
import { getCSRFToken } from 'lib/auth';
import { ApiBodyRequest } from 'models/api';
import { changeVMState } from 'lib/vm/changeVMState';

interface VmStatusBody {
  id: string;
  action: string;
  server: string;
  auth: string;
}

export default async function (
  { body }: ApiBodyRequest<VmStatusBody>,
  res: NextApiResponse,
): Promise<void> {
  if (body) {
    const { id, action, server, auth } = body;
    const token = await getCSRFToken(server, auth);
    const message = await changeVMState(id, action, server, auth, token);
    const response = { status: 200, message };
    res.send(response);
  }
}
