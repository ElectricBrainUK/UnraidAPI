import { NextApiRequest } from 'next';

export type ApiBodyRequest<T> = Omit<NextApiRequest, 'body'> & { body: T };
