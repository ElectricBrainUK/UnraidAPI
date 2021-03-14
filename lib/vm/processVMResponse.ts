import { simplifyResponse } from './simplifyResponse';
import { groupVmDetails } from './groupVmDetails';

export function processVMResponse(response, ip, auth) {
  let object = [];
  groupVmDetails(response, object);
  return simplifyResponse(object, ip, auth);
}
