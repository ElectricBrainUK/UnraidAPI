import fs from "fs";
import { getImage } from "../utils/Unraid";

export default function(req, res, next) {
  let servers = {};
  try {
    servers = JSON.parse(fs.readFileSync("config/servers.json"));
  } catch (e) {
    console.log("Failed to retrieve config file, creating new.");
    if (!fs.existsSync("config/")){
      fs.mkdirSync("config/");
    }
    fs.writeFileSync("config/servers.json", JSON.stringify(servers));
  }
  getImage(servers, res, req.path);
};
