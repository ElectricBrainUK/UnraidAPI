import fs from "fs";
import { changeVMState, getCSRFToken } from "../utils/Unraid";

export default function(req, res, next) {
  let body = [];
  let response = {};
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    data = JSON.parse(Buffer.concat(body).toString());
    if (data) {
      let servers = JSON.parse(fs.readFileSync("config/servers.json"));
      let auth = servers[data.server].authToken;
      let token = await getCSRFToken(data.server, auth);
      response.message = await changeVMState(data.id, data.action, data.server, auth, token);
      response.status = 200;
      res.send(response);
    }
  });
};

