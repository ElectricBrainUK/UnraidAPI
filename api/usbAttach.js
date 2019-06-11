import axios from "axios";
import { gatherDetailsFromEditVM } from "../utils/Unraid";

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
  console.log('-----------');
  console.log(data);
  let servers = await gatherDetailsFromEditVM(data.server, data.id);
  console.log('-----------');
  console.log(servers[data.server].vm.details[data.id].edit);
}