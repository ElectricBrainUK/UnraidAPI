import { changeVMState, gatherDetailsFromEditVM, getCSRFToken, requestChange } from "../utils/Unraid";
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
      response.message = await editVM(data);
      response.status = 200;
      res.send(response);
    }
  });
};

async function editVM(data) {
  let existingVMObject = await gatherDetailsFromEditVM(data.server, data.id);
  Object.keys(data.edit).forEach(key => {
    existingVMObject.edit[key] = data.edit[key];
  });

  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let auth = servers[data.server].authToken;
  let token = await getCSRFToken(data.server, auth);

  await changeVMState(data.id, "domain-stop", data.server, auth, token);
  let result = await requestChange(data.server, data.id, servers[data.server].authToken, existingVMObject.edit);
  await changeVMState(data.id, "domain-start", data.server, auth, token);
  return result;
}