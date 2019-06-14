import { gatherDetailsFromEditVM, requestAttach } from "../utils/Unraid";
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
      response.message = await attachPCI(data);
      response.status = 200;
      res.send(response);
    }
  });
};

async function attachPCI(data) {
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id);
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let attached = [];

  Object.keys(servers[data.server].vm.details).forEach(vmId => {
    let vm = servers[data.server].vm.details[vmId];
    if (vm.edit && vm.edit.pcis && vm.status === "started") {
      vm.edit.pcis.forEach(pciDevice => {
        if (pciDevice.id.split('.')[0] === data.pciId.split('.')[0] && vmId !== data.id && pciDevice.checked) {
          attached.push({pciId: pciDevice.id, vmId, vm});
        }
      });
    }
  });

  if (attached) {
    for (let i = 0; i < attached.length; i++) {
      removePCICheck(attached.vm.edit, attached.pciId);
      await requestAttach(data.server, attached.vmId, servers[data.server].authToken, attached.vm.edit);
    }
  }

  addPCICheck(vmObject.edit, data.pciId);
  return requestAttach(data.server, data.id, servers[data.server].authToken, vmObject.edit);
}

function removePCICheck(details, id) {
  details.pcis.filter(pciDevice => pciDevice.id.split('.')[0] === id.split('.')[0]).map(device => device.checked = false);
}

function addPCICheck(details, id) {
  details.pcis.filter(pciDevice => pciDevice.id.split('.')[0] === id.split('.')[0]).map(device => device.checked = true);
}