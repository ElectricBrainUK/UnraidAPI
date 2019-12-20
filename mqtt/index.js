import mqtt from "mqtt";
import { changeArrayState, changeDockerState, changeVMState, getCSRFToken, getUnraidDetails } from "../utils/Unraid";
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
      let keys = JSON.parse(fs.readFileSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys"));
      let servers = JSON.parse(fs.readFileSync("config/servers.json"));
      
      const topicParts = topic.split("/");
      let ip = "";
      let serverDetails = {};

      let serverTitleSanitised;
      for (let [serverIp, server] of Object.entries(servers)) {
        if (server.serverDetails && sanitise(server.serverDetails.title) === topicParts[1]) {
          serverTitleSanitised = sanitise(server.serverDetails.title);
          ip = serverIp;
          serverDetails = server;
          break;
        }
      }

      if (ip === "") {
        console.log("Failed to process message, servers not loaded. If the API just started this should go away after a minute, otherwise log into servers in the UI");
        return;
      }
      let token = await getCSRFToken(ip, keys[ip]);

      let vmIdentifier = "";
      let vmDetails = {};
      let vmSanitisedName = "";
      let dockerIdentifier = "";
      let dockerDetails = {};

      if (topicParts.length >= 3) {
        if (!topic.includes("docker") && serverDetails.vm) {
          Object.keys(serverDetails.vm.details).forEach(vmId => {
            const vm = serverDetails.vm.details[vmId];
            if (sanitise(vm.name) === topicParts[2]) {
              vmIdentifier = vmId;
              vmDetails = vm;
              vmSanitisedName = sanitise(vm.name);
            }
          });
        } else if (serverDetails.docker) {
          Object.keys(serverDetails.docker.details.containers).forEach(dockerId => {
            const docker = serverDetails.docker.details.containers[dockerId];
            if (sanitise(docker.name) === topicParts[2]) {
              dockerIdentifier = dockerId;
              dockerDetails = docker;
            }
          });
        }
      }

      if (topic.toLowerCase().includes("state")) {
        let command = "";
        switch (message.toString()) {
          case "started":
            if (vmDetails.status === 'paused' || vmDetails.status === 'pmsuspended' || dockerDetails.status === 'paused') {
              command = "domain-resume";
            } else {
              command = "domain-start";
            }
            break;
          case "\"started\"":
            if (vmDetails.status === 'paused' || vmDetails.status === 'pmsuspended' || dockerDetails.status === 'paused') {
              command = "domain-resume";
            } else {
              command = "domain-start";
            }
            break;
          case "stopped":
            command = "domain-stop";
            break;
          case "\"stopped\"":
            command = "domain-stop";
            break;
          case "paused":
            command = "domain-pause";
            break;
          case "kill":
            command = "domain-destroy";
            break;
          case "restart":
            command = "domain-restart";
            break;
        }

        if (!topic.includes("docker")) {
          await changeVMState(vmIdentifier, command, ip, keys[ip], token);
          const vmDetailsToSend = {
            id: vmIdentifier,
            status: message.toString(),
            coreCount: vmDetails.coreCount,
            ram: vmDetails.ramAllocation,
            primaryGPU: vmDetails.primaryGPU,
            name: vmSanitisedName,
            description: vmDetails.edit.description,
            mac: vmDetails.edit.nics[0] ? vmDetails.edit.nics[0].mac : undefined
          };
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName, JSON.stringify(vmDetailsToSend));
        } else {
          await changeDockerState(dockerIdentifier, command, ip, keys[ip], token);
          dockerDetails.status = message.toString();
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + sanitise(dockerDetails.name), JSON.stringify(dockerDetails));
        }
      } else if (topic.includes("attach")) {
        let data = {
          server: ip,
          id: vmIdentifier,
          auth: keys[ip],
          usbId: topicParts[3].replace("_", ":")
        };

        if (message.toString() && message.toString() !== "false" && message.toString() !== "False") {
          await attachUSB(data);
        } else {
          await detachUSB(data);
        }
        const usbDetails = vmDetails.edit.usbs.filter((usb) => sanitise(usb.id) === topicParts[3])[0];
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + topicParts[3], JSON.stringify({id: topicParts[3], attached: message.toString().toLowerCase() !== "false", name: sanitise(usbDetails.name), connected: !!usbDetails.connected}));
      } else if (topic.includes("array")) {
        let command = "start";
        if (message.toString() === "Stopped") {
          command = "stop";
        }
        await changeArrayState(command, ip, keys[ip], token);
        serverDetails.arrayStatus = message.toString();
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(server.serverDetails));
      }
    });

    client.on("error", function(error) {
      console.log("Can't connect" + error);
    });
  } catch (e) {
    if (e.toString().includes("no such file or directory, open") && e.toString().includes("mqttKeys")) {
      console.log("Server details failed to load. Have you set up any servers in the UI?");
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
        const vmSanitisedName = sanitise(vm.edit ? vm.edit.domain_name : vm.name);

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
        client.publish(process.env.MQTTBaseTopic + "/sensor/" + serverTitleSanitised + "/" + vmSanitisedName + "/config", JSON.stringify({
          "value_template": "{{ value_json.status }}",
          "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
          "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
          "name": serverTitleSanitised + "_" + vmSanitisedName + "_status",
          "unique_id": serverTitleSanitised + "_" + vmId + "_status",
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
            usbDetails.connected = !!device.connected;

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
            client.publish(process.env.MQTTBaseTopic + "/binary_sensor/" + serverTitleSanitised + "/" + vmSanitisedName + "_" + sanitiseUSBId + "/config", JSON.stringify({
              "payload_on": true,
              "payload_off": false,
              "value_template": "{{ value_json.connected }}",
              "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId,
              "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId,
              "name": serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBName + "_connected",
              "unique_id": serverTitleSanitised + "_" + vmId + "_" + sanitiseUSBId + "_connected",
              "device": {
                "identifiers": [serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBId],
                "name": serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBId,
                "manufacturer": sanitiseUSBName,
                "model": "USB Device"
              }
            }));
            client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId, JSON.stringify(usbDetails));
            client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId + "/attach");
          });
        }
      });

      if (server.docker && server.docker.details) {
        Object.keys(server.docker.details.containers).forEach(dockerId => {
          let docker = server.docker.details.containers[dockerId];
          docker.name = sanitise(docker.name);

          client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + docker.name + "/config", JSON.stringify({
            "payload_on": "started",
            "payload_off": "stopped",
            "value_template": "{{ value_json.status }}",
            "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name,
            "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name,
            "name": serverTitleSanitised + "_" + docker.name,
            "unique_id": serverTitleSanitised + "_" + dockerId,
            "device": {
              "identifiers": [serverTitleSanitised + "_" + docker.name],
              "name": serverTitleSanitised + "_" + docker.name,
              "manufacturer": server.serverDetails.motherboard,
              "model": "Docker"
            },
            "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name + "/dockerState"
          }));
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name, JSON.stringify(docker));
          client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name + "/dockerState");
        });
      }
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
