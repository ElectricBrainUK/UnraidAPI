import { gatherDetailsFromEditVM, requestChange } from "../utils/Unraid";
import fs from "fs";

export default function(req, res, next) {
  let body = [];
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    data = JSON.parse(Buffer.concat(body).toString());
    if (data) {
      let response = {};
      if (!data.option) {
        response.message = await attachUSB(data);
      } else if (data.option === 'reattach') {
        response.message = await reattachUSB(data);
      } else if (data.option === 'detach') {
        response.message = await detachUSB(data);
      }
      response.status = 200;
      res.send(response);
    }
  });
};

export async function attachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let attached = {};

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

  if (attached.vm) {
    removeUSBCheck(attached.vm.edit, attached.usbId);
    await requestChange(data.server, attached.vmId, data.auth, attached.vm.edit);
  }

  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit);
}

async function reattachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);

  removeUSBCheck(vmObject.edit, data.usbId);
  await requestChange(data.server, data.id, data.auth, vmObject.edit);
  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit);
}

export async function detachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);

  removeUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, data.auth, vmObject.edit);
}

function removeUSBCheck(details, id) {
  details.usbs.filter(usbDevice => usbDevice.id === id)[0].checked = false;
}

function addUSBCheck(details, id) {
  details.usbs.filter(usbDevice => usbDevice.id === id)[0].checked = true;
}
