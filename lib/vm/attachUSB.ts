import { gatherDetailsFromEditVM } from './gatherDetailsFromEditVM';
import { requestChange } from '../api/requestChange';
import { VmAttachUsbs, VmDetails, VmEdit } from '../../models/vm';
import { parseServers } from 'lib/storage/servers';
import { UsbBody } from 'models/api';

export async function attachUSB(data: UsbBody): Promise<string> {
  const vmObject = await gatherDetailsFromEditVM(
    data.server,
    data.id,
    undefined,
    data.auth,
  );

  const servers = await parseServers();
  let attached: VmAttachUsbs = undefined;

  Object.keys(servers[data.server].vm.details).forEach((vmId) => {
    const vm = servers[data.server].vm.details[vmId];
    if (vm.edit && vm.edit.usbs && vm.status === 'started') {
      vm.edit.usbs.forEach((usbDevice) => {
        if (
          usbDevice.id === data.usbId &&
          vmId !== data.id &&
          usbDevice.checked
        ) {
          attached = { usbId: usbDevice.id, vmId, vm };
        }
      });
    }
  });

  if (attached) {
    removeUSBCheck(attached.vm.edit, attached.usbId);
    await requestChange(
      data.server,
      attached.vmId,
      data.auth,
      attached.vm.edit,
      false,
    );
  }

  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit, false);
}

export async function reattachUSB(data: UsbBody): Promise<any> {
  const vmObject = await gatherDetailsFromEditVM(
    data.server,
    data.id,
    undefined,
    data.auth,
  );

  removeUSBCheck(vmObject.edit, data.usbId);
  await requestChange(data.server, data.id, data.auth, vmObject.edit, false);
  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit, false);
}
// all these `any`s are probably actually just string but i'm not sure
export async function detachUSB(data: UsbBody): Promise<any> {
  const vmObject: VmDetails = await gatherDetailsFromEditVM(
    data.server,
    data.id,
    undefined,
    data.auth,
  );

  removeUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit, false);
}

function removeUSBCheck(details: VmEdit, id: string) {
  details.usbs.filter((usbDevice) => usbDevice.id === id)[0].checked = false;
}

function addUSBCheck(details: VmEdit, id: string) {
  details.usbs.filter((usbDevice) => usbDevice.id === id)[0].checked = true;
}
