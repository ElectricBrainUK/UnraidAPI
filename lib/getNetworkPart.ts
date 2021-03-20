import { VmEditNic } from 'models/vm';

export function getNetworkPart(vmObject: { nics?: VmEditNic[] }, form: string) {
  if (vmObject?.nics?.length > 0) {
    vmObject.nics.forEach((nicDevice, index) => {
      form += `&nic%5B${index}%5D%5Bmac%5D=${nicDevice.mac}`;
      form += `&nic%5B${index}%5D%5Bnetwork%5D=${nicDevice.network}`;
    });
  }
  return form;
}
