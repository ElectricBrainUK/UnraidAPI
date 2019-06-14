import fs from "fs";
import {getUnraidDetails} from "../utils/Unraid";

export default function(req, res, next) {
  let response = {};
  response.servers = JSON.parse(fs.readFileSync("config/servers.json"));
  getUnraidDetails(response.servers);
  response.status = 200;
  res.send(response);
};