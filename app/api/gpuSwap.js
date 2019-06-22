import {
  addPCICheck,
  changeVMState, flipPCICheck,
  gatherDetailsFromEditVM,
  getCSRFToken,
  removePCICheck,
  requestAttach
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
      response.message = await gpuSwap(data);
      response.status = 200;
      res.send(response);
    }
  });
};

async function gpuSwap(data) {
  let vm1 = await gatherDetailsFromEditVM(data.server, data.id1);
  let vm2 = await gatherDetailsFromEditVM(data.server, data.id2);
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);

  let auth = servers[data.server].authToken;
  let token = await getCSRFToken(data.server, auth);

  let vm1PrimaryGPU = vm1.edit.pcis.filter(device => device.gpu && device.checked)[0];
  let vm2PrimaryGPU = vm2.edit.pcis.filter(device => device.gpu && device.checked)[0];

  removePCICheck(vm1.edit, vm1PrimaryGPU.id);
  removePCICheck(vm2.edit, vm2PrimaryGPU.id);
  addPCICheck(vm1.edit, vm2PrimaryGPU.id);
  addPCICheck(vm2.edit, vm1PrimaryGPU.id);

  if (data.pciIds) {
    data.pciIds.forEach(pciId => {
      flipPCICheck(vm1.edit, pciId);
      flipPCICheck(vm2.edit, pciId);
    });
  }

  await Promise.all([
    changeVMState(data.id1, "domain-stop", data.server, auth, token),
    changeVMState(data.id2, "domain-stop", data.server, auth, token)]);

  let result1 = await requestAttach(data.server, data.id1, servers[data.server].authToken, vm1.edit);
  let result2 = await requestAttach(data.server, data.id2, servers[data.server].authToken, vm2.edit);

  await Promise.all([
    changeVMState(data.id1, "domain-start", data.server, auth, token),
    changeVMState(data.id2, "domain-start", data.server, auth, token)]);

  return { vm1: result1, vm2: result2 };
}