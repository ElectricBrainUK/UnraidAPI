import { getUSBDetails } from './unraid/getUSBDetails';
import { getPCIDetails } from './unraid/getPCIDetails';
import { logIn } from './unraid/logIn';
import { getServerDetails } from './unraid/getServerDetails';
import { getVMs } from './getVMs';
import { getDockers } from './getDockers';

export async function getUnraidDetails(servers, serverAuth) {
  await logIn(servers, serverAuth);
  getServerDetails(servers, serverAuth);
  getVMs(servers, serverAuth);
  getDockers(servers, serverAuth);
  getUSBDetails(servers, serverAuth);
  getPCIDetails(servers);
}
