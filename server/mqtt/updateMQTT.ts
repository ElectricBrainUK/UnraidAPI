import { getUnraidDetails } from "../../lib/getUnraidDetails";
import { getServerDetails } from "./getServerDetails";
import * as fs from "fs";
import { MqttClient } from "mqtt";

export function updateMQTT(client: MqttClient) {
  try {
    let keys = JSON.parse(fs.readFileSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys").toString());
    let servers = JSON.parse(fs.readFileSync("config/servers.json").toString());
    let disabledDevices = [];
    try {
      disabledDevices = JSON.parse(fs.readFileSync("config/mqttDisabledDevices.json").toString());
    } catch (e) {

    }

    getUnraidDetails(servers, keys);

    let timer = 1000;
    Object.keys(servers).forEach(ip => {
      setTimeout(getServerDetails, timer, client, servers, disabledDevices, ip, timer);
      timer = timer + (process.env.MQTTRefreshRate ? +process.env.MQTTRefreshRate * 1000 : 20000) / 4;
    });
  } catch (e) {
    console.log(e);
    console.log("The secure keys for mqtt may have not been generated, you need to make 1 authenticated request via the API first for this to work");
  }
}
