import { changeVMState, gatherDetailsFromEditVM, getCSRFToken, requestChange } from "../utils/Unraid";
import fs from "fs";

const defaultVM = {
  gpus: [
    {
      id: "vnc",
      model: "qxl",
      keymap: "en-us"
    }
  ]
};

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
  let defaultVMObject = {};
  defaultVMObject.edit = Object.assign({}, defaultVM);
  defaultVMObject.edit.domain_uuid = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/; //todo generate a mac
  Object.keys(data.edit).forEach(key => {
    defaultVMObject.edit[key] = data.edit[key];
  });

  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let auth = servers[data.server].authToken;
  let token = await getCSRFToken(data.server, auth);

  await changeVMState(data.id, "domain-stop", data.server, auth, token);
  let result = await requestChange(data.server, data.id, servers[data.server].authToken, defaultVMObject.edit, create);
  await changeVMState(data.id, "domain-start", data.server, auth, token);
  return result;
}