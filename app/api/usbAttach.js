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
      response.message = await attachUSB(data);
      response.status = 200;
      res.send(response);
    }
  });
};

async function attachUSB(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id);
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
    await requestChange(data.server, attached.vmId, servers[data.server].authToken, attached.vm.edit);
  }

  addUSBCheck(vmObject.edit, data.usbId);
  return requestChange(data.server, data.id, servers[data.server].authToken, vmObject.edit);
}

function removeUSBCheck(details, id) {
  details.usbs.filter(usbDevice => usbDevice.id === id)[0].checked = false;
}

function addUSBCheck(details, id) {
  details.usbs.filter(usbDevice => usbDevice.id === id)[0].checked = true;
}