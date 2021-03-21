import { NextApiResponse } from 'next';
import { ApiBodyRequest, UsbBody } from 'models/api';
import { attachUSB, reattachUSB, detachUSB } from 'lib/vm/attachUSB';

export default async function (
  req: ApiBodyRequest<UsbBody | undefined>,
  res: NextApiResponse,
): Promise<void> {
  const { body } = req;

  if (body) {
    const response = { message: '', status: 500 };
    if (!body.option) {
      response.message = await attachUSB(body);
    } else if (body.option === 'reattach') {
      response.message = await reattachUSB(body);
    } else if (body.option === 'detach') {
      response.message = await detachUSB(body);
    }
    response.status = 200;
    res.send(response);
  }
}
