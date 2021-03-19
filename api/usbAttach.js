import { gatherDetailsFromEditVM, requestChange } from "../utils/Unraid";
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
        response.message = await attachUSB(data);
      } else if (data.option === 'reattach') {
        response.message = await reattachUSB(data);
      } else if (data.option === 'detach') {
        response.message = await detachUSB(data);
      }
      response.status = 200;
      res.send(response);
    }
  });
};
