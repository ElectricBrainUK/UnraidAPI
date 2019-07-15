import { changeVMState, getCSRFToken, requestChange } from "../utils/Unraid";

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

  let token = await getCSRFToken(data.server, data.auth);

  await changeVMState(data.id, "domain-stop", data.server, data.auth, token);
  let result = await requestChange(data.server, data.id, data.auth, defaultVMObject.edit, create);
  await changeVMState(data.id, "domain-start", data.server, data.auth, token);
  return result;
}