import mqtt from "mqtt";
import { changeVMState, getCSRFToken, getUnraidDetails } from "../utils/Unraid";
import fs from "fs";

export default function startMQTTClient() {
  if (!process.env.MQTTBroker) {
    console.log("mqtt disabled");
    return;
  }

  const options = {
    username: process.env.MQTTUser,
    password: process.env.MQTTPass,
    port: process.env.MQTTPort,
    host: process.env.MQTTBroker
  };
  const client = mqtt.connect("mqtt://" + process.env.MQTTBroker, options);

  try {
    let keys = JSON.parse(fs.readFileSync("secure/mqttKeys"));
    let servers = JSON.parse(fs.readFileSync("config/servers.json"));

    client.on("connect", () => {
      console.log("Connected to mqtt broker");
      updateMQTT(client);
      mqttRepeat(client);
    }, (err) => {
      console.log(err);
    });

    client.on("message", async (topic, message) => {
      if (topic.includes("state")) {
        const topicParts = topic.split("/");
        let ip = "";
        let serverDetails = {};

        for (let [serverIp, server] of Object.entries(servers)) {
          if (server.serverDetails && sanitise(server.serverDetails.title) === topicParts[1]) {
            ip = serverIp;
            serverDetails = server;
            break;
          }
        }

        let token = await getCSRFToken(ip, keys[ip]);
        let vmIdentifier = "";
        let vmDetails = {};
        Object.keys(serverDetails.vm.details).forEach(vmId => {
          const vm = serverDetails.vm.details[vmId];
          if (sanitise(vm.name) === topicParts[2]) {
            vmIdentifier = vmId;
            vmDetails = vm;
          }
        });

        let command = "";
        switch (message.toString()) {
          case "started":
            command = "domain-start";
            break;
          case "stopped":
            command = "domain-stop";
            break;
        }

        await changeVMState(vmIdentifier, command, ip, keys[ip], token);
      }
    });

    client.on("error", function(error) {
      console.log("Can't connect" + error);
    });
  } catch (e) {
    setTimeout(() => {
      startMQTTClient();
    }, 30000);
  }
}

function updateMQTT(client) {
  try {
    let keys = JSON.parse(fs.readFileSync("secure/mqttKeys"));
    let servers = JSON.parse(fs.readFileSync("config/servers.json"));

    getUnraidDetails(servers, keys);

    Object.keys(servers).forEach(ip => {
      let server = servers[ip];
      if (!server.serverDetails) {
        return;
      }
      server.serverDetails.on = true;
      const serverTitleSanitised = sanitise(server.serverDetails.title);
      client.publish(process.env.MQTTBaseTopic + "/binary_sensor/" + server.serverDetails.title + "/config", JSON.stringify({
        "payload_on": true,
        "payload_off": false,
        "value_template": "{{ value_json.on }}",
        "device_class": "power",
        "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
        "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
        "name": serverTitleSanitised,
        "unique_id": serverTitleSanitised + " unraid api server",
        "device": { "identifiers": [serverTitleSanitised], "name": serverTitleSanitised, "manufacturer": server.serverDetails.motherboard }
      }));
      client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(server.serverDetails));

      Object.keys(server.vm.details).forEach(vmId => {
        let vm = server.vm.details[vmId];
        const vmSanitisedName = sanitise(vm.edit.domain_name);
        const vmDetails = {
          id: vmId,
          status: vm.status,
          coreCount: vm.coreCount,
          ram: vm.ramAllocation,
          primaryGPU: vm.primaryGPU,
          name: vmSanitisedName,
          description: vm.edit.description,
          mac: vm.edit.nics[0] ? vm.edit.nics[0].mac : undefined,
          usbs: vm.edit.usbs,
        };
        client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + vmSanitisedName + "/config", JSON.stringify({
          "payload_on": "started",
          "payload_off": "stopped",
          "value_template": "{{ value_json.status }}",
          "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
          "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
          "name": serverTitleSanitised + "_" + vmSanitisedName,
          "unique_id": serverTitleSanitised + "_" + vmId,
          "device": { "identifiers": [serverTitleSanitised + "_" + vmSanitisedName], "name": serverTitleSanitised + "_" + vmSanitisedName, "manufacturer": server.serverDetails.motherboard },
          "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/state"
        }));
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName, JSON.stringify(vmDetails));
        client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/state");
      });
    });
  } catch (e) {
    console.log(e);
    console.log("The secure keys for mqtt have not been generated, you need to make 1 authenticated request via the API first for this to work");
  }
}

function mqttRepeat(client) {
  setTimeout(function() {
    updateMQTT(client);
    mqttRepeat(client);
  }, 10000);
}

function sanitise(string) {
  return string.toLowerCase().split(" ").join("_").split(".").join("").split("(").join("").split(")").join("")
}
