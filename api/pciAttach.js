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
      if (!data.option) {
        response.message = await attachPCI(data);
      } else if (data.option === 'detach') {
        response.message = await detachPCI(data);
      }
      response.status = 200;
      res.send(response);
    }
  });
};

async function attachPCI(data) {
  if (data.pciId && !data.pciIds) {
    data.pciIds = [data.pciId];
  }

  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);
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

  let token = await getCSRFToken(data.server, data.auth);
  let stopped = {};
  if (attached) {
    for (let i = 0; i < attached.length; i++) {
      let vmWithPciDevice = attached[i];
      removePCICheck(vmWithPciDevice.vm.edit, vmWithPciDevice.pciId);
      if (!stopped[vmWithPciDevice.vmId]) {
        await changeVMState(vmWithPciDevice.vmId, "domain-stop", data.server, data.auth, token);
      }
      await requestChange(data.server, vmWithPciDevice.vmId, servers[data.server].authToken, vmWithPciDevice.vm.edit);
      stopped[vmWithPciDevice.vmId] = true;
    }
  }

  await Promise.all(Object.keys(stopped).map(stoppedVMId => changeVMState(stoppedVMId, "domain-start", data.server, data.auth, token)));

  await changeVMState(data.id, "domain-stop", data.server, data.auth, token);
  let result = await requestChange(data.server, data.id, data.auth, vmObject.edit);
  await changeVMState(data.id, "domain-start", data.server, data.auth, token);
  return result;
}

async function detachPCI(data) {
  if (data.pciId && !data.pciIds) {
    data.pciIds = [data.pciId];
  }

  let vmObject = await gatherDetailsFromEditVM(data.server, data.id, undefined, data.auth);

  data.pciIds.forEach(pciId => {
    removePCICheck(vmObject.edit, pciId);
  });

  let token = await getCSRFToken(data.server, data.auth);
  await changeVMState(data.id, "domain-stop", data.server, data.auth, token);
  let result = await requestChange(data.server, data.id, data.auth, vmObject.edit);
  await changeVMState(data.id, "domain-start", data.server, data.auth, token);
  return result;
}