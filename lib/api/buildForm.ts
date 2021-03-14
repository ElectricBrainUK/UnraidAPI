import { getCSRFToken } from '../auth';
import { getCPUPart } from '../getCPUPart';
import { getDiskPart } from '../getDiskPart';
import { getNetworkPart } from '../getNetworkPart';
import { getPCIPart } from '../getPCIPart';
import { getSharePart } from '../getSharePart';
import { getStaticPart } from '../getStaticPart';
import { getUSBPart } from '../getUSBPart';

export async function buildForm(ip: string, auth, id, vmObject, create) {
  let form = getStaticPart(vmObject, id, create);
  form += '&csrf_token=' + (await getCSRFToken(ip, auth));
  form = getCPUPart(vmObject, form);
  form = getDiskPart(vmObject, form);
  form = getSharePart(vmObject, form);
  form = getPCIPart(vmObject, form);
  form = getUSBPart(vmObject, form);
  form = getNetworkPart(vmObject, form);
  return form;
}
