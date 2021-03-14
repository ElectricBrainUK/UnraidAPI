import { getUSBDetails } from './unraid/getUSBDetails';
import { getPCIDetails } from './unraid/getPCIDetails';
import { logIn } from './unraid/logIn';
import { getServerDetails } from './unraid/getServerDetails';
import { getDockers } from './docker/getDockers';
import { getVMs } from './vm/getVMs';

export async function getUnraidDetails(servers, serverAuth) {
  await logIn(servers, serverAuth);
  getServerDetails(servers, serverAuth);
  getVMs(servers, serverAuth);
  getDockers(servers, serverAuth);
  getUSBDetails(servers, serverAuth);
  getPCIDetails(servers);
}
