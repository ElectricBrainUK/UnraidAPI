import {
  addPCICheck,
  changeVMState,
  gatherDetailsFromEditVM,
  getCSRFToken,
  removePCICheck,
  requestChange
} from "../utils/Unraid";
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
  if (data.pciId && !data.pciIds) {
    data.pciIds = [data.pciId];
  }

  let vmObject = await gatherDetailsFromEditVM(data.server, data.id);
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let attached = [];

  data.pciIds.forEach(pciId => {
    Object.keys(servers[data.server].vm.details).forEach(vmId => {
      let vm = servers[data.server].vm.details[vmId];
      if (vm.edit && vm.edit.pcis && vm.status === "started") {
        vm.edit.pcis.forEach(pciDevice => {
          if (pciDevice.id.split(".")[0] === pciId.split(".")[0] && vmId !== data.id && pciDevice.checked) {
            attached.push({ pciId: pciDevice.id, vmId, vm });
          }
        });
      }
    });
    addPCICheck(vmObject.edit, pciId);
  });

  let auth = servers[data.server].authToken;
  let token = await getCSRFToken(data.server, auth);
  let stopped = {};
  if (attached) {
    for (let i = 0; i < attached.length; i++) {
      let vmWithPciDevice = attached[i];
      removePCICheck(vmWithPciDevice.vm.edit, vmWithPciDevice.pciId);
      if (!stopped[vmWithPciDevice.vmId]) {
        await changeVMState(vmWithPciDevice.vmId, "domain-stop", data.server, auth, token);
      }
      await requestChange(data.server, vmWithPciDevice.vmId, servers[data.server].authToken, vmWithPciDevice.vm.edit);
      stopped[vmWithPciDevice.vmId] = true;
    }
  }

  await Promise.all(Object.keys(stopped).map(stoppedVMId => changeVMState(stoppedVMId, "domain-start", data.server, auth, token)));

  await changeVMState(data.id, "domain-stop", data.server, auth, token);
  let result = await requestChange(data.server, data.id, servers[data.server].authToken, vmObject.edit);
  await changeVMState(data.id, "domain-start", data.server, auth, token);
  return result;
}