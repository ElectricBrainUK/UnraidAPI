import { extractValue } from './extractValue';
import { getVMStaticData } from './getVMStaticData';
import { extractCPUDetails } from './extractCPUDetails';
import { extractDiskData } from './extractDiskData';
import { extractShareData } from './extractShareData';
import { extractUSBData } from './extractUSBData';
import { extractPCIData } from './extractPCIData';
import { extractGPUData } from './extractGPUData';
import { extractSoundData } from './extractSoundData';
import { extractNICInformation } from './extractNICInformation';

export function extractVMDetails(vmObject, response, ip) {
  vmObject.xml = extractValue(
    response.data,
    '<textarea id="addcode" name="xmldesc" placeholder="Copy &amp; Paste Domain XML Configuration Here." autofocus>',
    '</textarea>',
  )
    .split('&lt;')
    .join('<')
    .split('&gt;')
    .join('>');

  vmObject.edit = getVMStaticData(response);

  vmObject.edit.vcpus = extractCPUDetails(response);

  vmObject.edit.disks = extractDiskData(response);

  vmObject.edit.shares = extractShareData(response);

  vmObject.edit.usbs = extractUSBData(response, vmObject, ip);

  vmObject.edit.pcis = extractPCIData(response);

  extractGPUData(response, vmObject);

  extractSoundData(response, vmObject);

  vmObject.edit.nics = extractNICInformation(response);
  return vmObject;
}
