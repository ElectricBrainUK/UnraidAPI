import fs from "fs";
import { gatherDetailsFromEditVM } from "./gatherDetailsFromEditVM";
import { requestChange } from "../api/requestChange";
import { VmAttachUsbs } from "../../models/vm";

export async function attachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);
  let rawdata = fs.readFileSync("config/servers.json").toString();
  let servers = JSON.parse(rawdata);
  let attached: VmAttachUsbs = undefined;

  Object.keys(servers[data.server].vm.details).forEach(vmId => {
    let vm = servers[data.server].vm.details[vmId];
    if (vm.edit && vm.edit.usbs && vm.status === "started") {
      vm.edit.usbs.forEach(usbDevice => {
        if (usbDevice.id === data.usbId && vmId !== data.id && usbDevice.checked) {
          attached = {usbId: usbDevice.id, vmId, vm};
        }
      });
    }
  });

  if (attached) {
    removeUSBCheck(attached.vm.edit, attached.usbId);
    await requestChange(data.server, attached.vmId, data.auth, attached.vm.edit, false);
  }

  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit, false);
}

export async function reattachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);

  removeUSBCheck(vmObject.edit, data.usbId);
  await requestChange(data.server, data.id, data.auth, vmObject.edit, false);
  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit, false);
}

export async function detachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);

  removeUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit, false);
}

function removeUSBCheck(details, id) {
  details.usbs.filter(usbDevice => usbDevice.id === id)[0].checked = false;
}

function addUSBCheck(details, id) {
  details.usbs.filter(usbDevice => usbDevice.id === id)[0].checked = true;
}
