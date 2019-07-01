import fs from "fs";
import { getUnraidDetails } from "../utils/Unraid";

export default function(req, res, next) {
  let servers = JSON.parse(fs.readFileSync("config/servers.json"));
  if (!req.headers.authorization || Object.keys(req.headers.authorization).length < Object.keys(servers).length) {
    let response = {};
    Object.keys(servers).forEach(ip => {
      response[ip] = true;
    });
    res.send({servers: response});
    return;
  }
  let response = {};
  response.servers = JSON.parse(fs.readFileSync("config/servers.json"));
  getUnraidDetails(response.servers, req.headers.authorization);
  response.status = 200;
  res.send(response);
};