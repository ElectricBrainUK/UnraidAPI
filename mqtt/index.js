import mqtt from "mqtt";
import { changeArrayState, changeVMState, getCSRFToken, getUnraidDetails } from "../utils/Unraid";
import fs from "fs";
import { attachUSB, detachUSB } from "../api/usbAttach";

let retry;

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
    let keys = JSON.parse(fs.readFileSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys"));
    let servers = JSON.parse(fs.readFileSync("config/servers.json"));

    client.on("connect", () => {
      console.log("Connected to mqtt broker");
      updateMQTT(client);
      if (repeater) {
        repeater = clearTimeout(repeater);
      }
      mqttRepeat(client);
    }, (err) => {
      console.log(err);
    });

    client.on("message", async (topic, message) => {
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

      if (topicParts.length >= 3) {
        Object.keys(serverDetails.vm.details).forEach(vmId => {
          const vm = serverDetails.vm.details[vmId];
          if (sanitise(vm.name) === topicParts[2]) {
            vmIdentifier = vmId;
            vmDetails = vm;
          }
        });
      }

      if (topic.includes("state")) {
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
      } else if (topic.includes("attach")) {
        let data = {
          server: ip,
          id: vmIdentifier,
          auth: keys[ip],
          usbId: topicParts[3].replace("_", ":")
        };

        if (message.toString() && message.toString() !== 'false' && message.toString() !== 'False') {
          await attachUSB(data);
        } else {
          await detachUSB(data);
        }
      } else if (topic.includes("array")) {
        let command = "start";
        if (message.toString() === 'Stopped') {
          command = 'stop';
        }
        await changeArrayState(command, ip, keys[ip], token);
      }
    });

    client.on("error", function(error) {
      console.log("Can't connect" + error);
    });
  } catch (e) {
    if (e.toString().includes('no such file or directory, open') && e.toString().includes('mqttKeys')) {
      console.log("Server details failed to load. Have you set up any servers in the UI?")
    } else {
      console.log(e);
    }
    if (retry) {
      retry = clearInterval(retry);
    }
    retry = setTimeout(() => {
      startMQTTClient();
    }, 30000);
  }
}

function updateMQTT(client) {
  try {
    let keys = JSON.parse(fs.readFileSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys"));
    let servers = JSON.parse(fs.readFileSync("config/servers.json"));

    getUnraidDetails(servers, keys);

    Object.keys(servers).forEach(ip => {
      let server = servers[ip];
      if (!server.serverDetails) {
        return;
      }
      server.serverDetails.on = true;
      const serverTitleSanitised = sanitise(server.serverDetails.title);
      client.publish(process.env.MQTTBaseTopic + "/binary_sensor/" + serverTitleSanitised + "/config", JSON.stringify({
        "payload_on": true,
        "payload_off": false,
        "value_template": "{{ value_json.on }}",
        "device_class": "power",
        "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
        "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
        "name": serverTitleSanitised,
        "unique_id": serverTitleSanitised + " unraid api server",
        "device": {
          "identifiers": [serverTitleSanitised],
          "name": serverTitleSanitised,
          "manufacturer": server.serverDetails.motherboard,
          "model": "Unraid Server"
        }
      }));
      client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/config", JSON.stringify({
        "payload_on": "Started",
        "payload_off": "Stopped",
        "value_template": "{{ value_json.arrayStatus }}",
        "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
        "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
        "name": serverTitleSanitised + "_array",
        "unique_id": serverTitleSanitised + " unraid api array",
        "device": {
          "identifiers": [serverTitleSanitised],
          "name": serverTitleSanitised,
          "manufacturer": server.serverDetails.motherboard,
          "model": "Unraid Server"
        },
        "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/array"
      }));
      client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/array");
      client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(server.serverDetails));

      Object.keys(server.vm.details).forEach(vmId => {
        let vm = server.vm.details[vmId];
        const vmSanitisedName = sanitise(vm.edit ? vm.edit.domain_name : vm.name );

        const vmDetails = {
          id: vmId,
          status: vm.status,
          coreCount: vm.coreCount,
          ram: vm.ramAllocation,
          primaryGPU: vm.primaryGPU,
          name: vmSanitisedName,
          description: vm.edit.description,
          mac: vm.edit.nics[0] ? vm.edit.nics[0].mac : undefined
        };


        client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + vmSanitisedName + "/config", JSON.stringify({
          "payload_on": "started",
          "payload_off": "stopped",
          "value_template": "{{ value_json.status }}",
          "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
          "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
          "name": serverTitleSanitised + "_" + vmSanitisedName,
          "unique_id": serverTitleSanitised + "_" + vmId,
          "device": {
            "identifiers": [serverTitleSanitised + "_" + vmSanitisedName],
            "name": serverTitleSanitised + "_" + vmSanitisedName,
            "manufacturer": server.serverDetails.motherboard,
            "model": "VM"
          },
          "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/state"
        }));
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName, JSON.stringify(vmDetails));
        client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/state");

        if (vm.edit.usbs && vm.edit.usbs.length > 0) {
          vm.edit.usbs.map(device => {
            const sanitiseUSBName = sanitise(device.name);
            const sanitiseUSBId = sanitise(device.id);

            let usbDetails = {};
            usbDetails.name = sanitiseUSBName;
            usbDetails.attached = !!device.checked;
            usbDetails.id = device.id;

            client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + vmSanitisedName + "_" + sanitiseUSBId + "/config", JSON.stringify({
              "payload_on": true,
              "payload_off": false,
              "value_template": "{{ value_json.attached }}",
              "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId,
              "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId,
              "name": serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBName,
              "unique_id": serverTitleSanitised + "_" + vmId + "_" + sanitiseUSBId,
              "device": {
                "identifiers": [serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBId],
                "name": serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBId,
                "manufacturer": sanitiseUSBName,
                "model": "USB Device"
              },
              "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId + "/attach"
            }));
            client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId, JSON.stringify(usbDetails));
            client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId + "/attach");
          });
        }
      });
    });
  } catch (e) {
    console.log(e);
    console.log("The secure keys for mqtt have not been generated, you need to make 1 authenticated request via the API first for this to work");
  }
}

let repeater;

function mqttRepeat(client) {
  repeater = setTimeout(function() {
    updateMQTT(client);
    mqttRepeat(client);
  }, 20000);
}

function sanitise(string) {
  if (!string) {
    return "";
  }
  return string.toLowerCase().split(" ").join("_").split(".").join("").split("(").join("").split(")").join("").split(":").join("_");
}
