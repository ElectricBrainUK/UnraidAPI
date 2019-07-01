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
      let token = await getCSRFToken(data.server, data.auth);
      response.message = await changeVMState(data.id, data.action, data.server, data.auth, token);
      response.status = 200;
      res.send(response);
    }
  });
};

