import { getUSBDetails } from './unraid/getUSBDetails';
import { getPCIDetails } from './unraid/getPCIDetails';
import { logIn } from './unraid/logIn';
import { getServerDetails } from './unraid/getServerDetails';
import { getDockers } from './docker/getDockers';
import { getVMs } from './vm/getVMs';
import { ServerMap } from 'models/server';

export async function getUnraidDetails(
  servers: ServerMap,
  serverAuth: Record<string, string>,
): Promise<void> {
  await logIn(servers, serverAuth);
  getServerDetails(servers, serverAuth);
  getVMs(servers, serverAuth);
  getDockers(servers, serverAuth);
  getUSBDetails(servers, serverAuth);
  getPCIDetails(servers);
}
