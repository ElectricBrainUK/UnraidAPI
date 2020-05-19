import mqtt from "mqtt";
import {
  changeArrayState,
  changeDockerState,
  changeServerState,
  changeVMState,
  getCSRFToken,
  getUnraidDetails
} from "../utils/Unraid";
import fs from "fs";
import { attachUSB, detachUSB } from "../api/usbAttach";
import uniqid from "uniqid";

let retry;

let updated = {};

export default function startMQTTClient() {
  if (!process.env.MQTTBroker) {
    console.log("mqtt disabled");
    return;
  }

  getVMDetails = getVMDetails.bind(this);
  getDockerDetails = getDockerDetails.bind(this);
  getServerDetails = getServerDetails.bind(this);

  const options = {
    username: process.env.MQTTUser,
    password: process.env.MQTTPass,
    port: process.env.MQTTPort,
    host: process.env.MQTTBroker,
    rejectUnauthorized: process.env.MQTTSelfSigned !== "true"
  };
  const client = mqtt.connect(process.env.MQTTSecure === "true" ? "mqtts://" : "mqtt://" + process.env.MQTTBroker, options);

  try {
    client.on("connect", () => {
      console.log("Connected to mqtt broker");
      client.subscribe(process.env.MQTTBaseTopic + "/bridge/state");
      updateMQTT(client);
      if (repeater) {
        repeater = clearTimeout(repeater);
      }
      mqttRepeat(client);
    }, (err) => {
      console.log(err);
    });

    client.on("message", async (topic, message) => {
      let queryID = await uniqid.time("MQTT-R-", "");
      console.log("Received MQTT Topic: " + topic + " and Message: " + message + " assigning ID: " + queryID);

      if (topic === (process.env.MQTTBaseTopic + "/bridge/state")) {
        updated = {};
        console.log("Invalidating caches as the MQTT Bridge just restarted");
        console.log(queryID + " succeeded");
        return;
      }

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
        console.log("Failed to process " + queryID + ", servers not loaded. If the API just started this should go away after a minute, otherwise log into servers in the UI");
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

      let responses = [];

      if (topic.toLowerCase().includes("state")) {
        let command = "";
        switch (message.toString()) {
          case "started":
            if (vmDetails.status === "paused" || vmDetails.status === "pmsuspended" || dockerDetails.status === "paused") {
              command = "domain-resume";
            } else {
              command = "domain-start";
            }
            break;
          case "\"started\"":
            if (vmDetails.status === "paused" || vmDetails.status === "pmsuspended" || dockerDetails.status === "paused") {
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
          case "hibernate":
            command = "domain-pmsuspend";
            break;
        }

        if (!topic.includes("docker")) {
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
          console.log("Updating MQTT for: " + queryID);
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName, JSON.stringify(vmDetailsToSend));

          responses.push(await changeVMState(vmIdentifier, command, ip, keys[ip], token));
        } else {
          dockerDetails.status = message.toString();
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + sanitise(dockerDetails.name), JSON.stringify(dockerDetails));
          responses.push(await changeDockerState(dockerIdentifier, command, ip, keys[ip], token));
        }
      } else if (topic.includes("attach")) {
        let data = {
          server: ip,
          id: vmIdentifier,
          auth: keys[ip],
          usbId: topicParts[3].replace("_", ":")
        };

        if (message.toString() && message.toString() !== "false" && message.toString() !== "False") {
          responses.push(await attachUSB(data));
        } else {
          responses.push(await detachUSB(data));
        }
        const usbDetails = vmDetails.edit.usbs.filter((usb) => sanitise(usb.id) === topicParts[3])[0];
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + topicParts[3], JSON.stringify({
          id: topicParts[3],
          attached: message.toString().toLowerCase() !== "false",
          name: sanitise(usbDetails.name),
          connected: !!usbDetails.connected
        }));
      } else if (topic.includes("array")) {
        let command = "start";
        if (message.toString() === "Stopped") {
          command = "stop";
        }
        serverDetails.arrayStatus = message.toString();
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(serverDetails));
        responses.push(await changeArrayState(command, ip, keys[ip], token));
      } else if (topic.includes("powerOff")) {
        serverDetails.on = false;
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(serverDetails));
        responses.push(await changeServerState("shutdown", ip, keys[ip], token));
      } else if (topic.includes("reboot")) {
        serverDetails.on = false;
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(serverDetails));
        responses.push(await changeServerState("reboot", ip, keys[ip], token));
      } else if (topic.includes("check")) {
        if (!serverDetails.parityCheckRunning) {
          serverDetails.parityCheckRunning = true;
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(serverDetails));
          responses.push(await changeServerState("check", ip, keys[ip], token));
        } else {
          serverDetails.parityCheckRunning = false;
          client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(serverDetails));
          responses.push(await changeServerState("check-cancel", ip, keys[ip], token));
        }
      } else if (topic.includes("move")) {
        serverDetails.moverRunning = true;
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(serverDetails));
        responses.push(await changeServerState("move", ip, keys[ip], token));
      }

      let success = true;
      responses.forEach(response => {
        if (response && success) {
          success = !!response.success;
        } else if (!response) {
          success = false;
          console.log("Part of " + queryID + " failed.");
        }
        if (response && response.error) {
          success = false;
          console.log("Part of " + queryID + " failed with response: " + response.error);
        }
      });
      if (success) {
        console.log(queryID + " succeeded");
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
    let disabledDevices = [];
    try {
      disabledDevices = JSON.parse(fs.readFileSync("config/mqttDisabledDevices.json"));
    } catch (e) {

    }

    getUnraidDetails(servers, keys);

    let timer = 1000;
    Object.keys(servers).forEach(ip => {
      setTimeout(getServerDetails, timer, client, servers, disabledDevices, ip, timer);
      timer = timer + (process.env.MQTTRefreshRate ? process.env.MQTTRefreshRate * 1000 : 20000) / 4;
    });
  } catch (e) {
    console.log(e);
    console.log("The secure keys for mqtt may have not been generated, you need to make 1 authenticated request via the API first for this to work");
  }
}

let repeater;
let count = 0;

function mqttRepeat(client) {
  repeater = setTimeout(function() {
    count++;
    if (count > (60 / (process.env.MQTTRefreshRate ? process.env.MQTTRefreshRate : 20)) * (process.env.MQTTCacheTime ? process.env.MQTTCacheTime : 60)) {
      count = 0;
      updated = {};
    }
    updateMQTT(client);
    mqttRepeat(client);
  }, process.env.MQTTRefreshRate ? process.env.MQTTRefreshRate * 1000 : 20000);
}

function sanitise(string) {
  if (!string) {
    return "";
  }
  return string.toLowerCase().split(" ").join("_").split(".").join("").split("(").join("").split(")").join("").split(":").join("_");
}

function getServerDetails(client, servers, disabledDevices, ip, timer) {
  let server = servers[ip];
  if (!server.serverDetails || disabledDevices.includes(ip)) {
    return;
  }
  const serverTitleSanitised = sanitise(server.serverDetails.title);

  if (!updated[ip]) {
    updated[ip] = {};
  }

  if (updated[ip].details !== JSON.stringify(server.serverDetails)) {
    const serverDevice = {
      "identifiers": [serverTitleSanitised],
      "name": serverTitleSanitised + "_server",
      "manufacturer": server.serverDetails.motherboard,
      "model": "Unraid Server"
    };
    client.publish(process.env.MQTTBaseTopic + "/binary_sensor/" + serverTitleSanitised + "/config", JSON.stringify({
      "payload_on": true,
      "payload_off": false,
      "value_template": "{{ value_json.on }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "name": serverTitleSanitised + "_server",
      "unique_id": serverTitleSanitised + " unraid api server",
      "device": serverDevice
    }));
    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/config", JSON.stringify({
      "payload_on": "Started",
      "payload_off": "Stopped",
      "value_template": "{{ value_json.arrayStatus }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "name": serverTitleSanitised + "_array",
      "unique_id": serverTitleSanitised + " unraid api array",
      "device": serverDevice,
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/array"
    }));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/array");

    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/powerOff/config", JSON.stringify({
      "payload_on": false,
      "payload_off": true,
      "value_template": "{{ value_json.on }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "name": serverTitleSanitised + "_power_off",
      "unique_id": serverTitleSanitised + " unraid server power off",
      "device": serverDevice,
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/powerOff"
    }));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/powerOff");

    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/reboot/config", JSON.stringify({
      "payload_on": false,
      "payload_off": true,
      "value_template": "{{ value_json.on }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "name": serverTitleSanitised + "_reboot",
      "unique_id": serverTitleSanitised + " unraid server reboot",
      "device": serverDevice,
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/reboot"
    }));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/reboot");

    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/parityCheck/config", JSON.stringify({
      "payload_on": true,
      "payload_off": false,
      "value_template": "{{ value_json.parityCheckRunning }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "name": serverTitleSanitised + "_partityCheck",
      "unique_id": serverTitleSanitised + " unraid server parity check",
      "device": serverDevice,
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/check"
    }));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/check");

    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/mover/config", JSON.stringify({
      "payload_on": true,
      "payload_off": false,
      "value_template": "{{ value_json.moverRunning }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised,
      "name": serverTitleSanitised + "_mover",
      "unique_id": serverTitleSanitised + " unraid server mover",
      "device": serverDevice,
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/move"
    }));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/move");

    client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised, JSON.stringify(server.serverDetails));
    updated[ip].details = JSON.stringify(server.serverDetails);
  }

  if (server.vm && server.vm.details && !disabledDevices.includes(ip + "|VMs")) {
    Object.keys(server.vm.details).forEach(vmId => {
      let vm = server.vm.details[vmId];
      setTimeout(getVMDetails, timer, client, vm, disabledDevices, vmId, serverTitleSanitised, ip, server);
      timer = timer + (process.env.MQTTRefreshRate ? process.env.MQTTRefreshRate * 1000 : 20000) / 20;
    });
  }

  if (server.docker && server.docker.details && !disabledDevices.includes(ip + "|Dockers")) {
    Object.keys(server.docker.details.containers).forEach(dockerId => {
      setTimeout(getDockerDetails, timer, client, serverTitleSanitised, disabledDevices, dockerId, ip, server);
      timer = timer + (process.env.MQTTRefreshRate ? process.env.MQTTRefreshRate * 1000 : 20000) / 20;
    });
  }
}

function getVMDetails(client, vm, disabledDevices, vmId, serverTitleSanitised, ip, server) {
  if (disabledDevices.includes(ip + "|" + vmId)) {
    return;
  }
  const vmSanitisedName = sanitise(vm.edit ? vm.edit.domain_name : vm.name);

  const vmDetails = {
    id: vmId,
    status: vm.status,
    coreCount: vm.coreCount,
    ram: vm.ramAllocation,
    primaryGPU: vm.primaryGPU,
    name: vmSanitisedName,
    description: vm.edit ? vm.edit.description : "Unknown",
    mac: vm.edit && vm.edit.nics && vm.edit.nics[0] ? vm.edit.nics[0].mac : undefined
  };

  if (!updated[ip]) {
    updated[ip] = {};
  }


  if (!updated[ip].vms) {
    updated[ip].vms = {};
  }

  if (!updated[ip].vms[vmId] || !updated[ip].vms[vmId].details || updated[ip].vms[vmId].details !== JSON.stringify(vmDetails)) {
    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + vmSanitisedName + "/config", JSON.stringify({
      "payload_on": "started",
      "payload_off": "stopped",
      "value_template": "{{ value_json.status }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
      "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
      "name": serverTitleSanitised + "_VM_" + vmSanitisedName,
      "unique_id": serverTitleSanitised + "_" + vmId,
      "device": {
        "identifiers": [serverTitleSanitised + "_" + vmSanitisedName],
        "name": serverTitleSanitised + "_VM_" + vmSanitisedName,
        "manufacturer": server.serverDetails.motherboard,
        "model": "VM"
      },
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/state"
    }));
    client.publish(process.env.MQTTBaseTopic + "/sensor/" + serverTitleSanitised + "/" + vmSanitisedName + "/config", JSON.stringify({
      "value_template": "{{ value_json.status }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
      "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName,
      "name": serverTitleSanitised + "_VM_" + vmSanitisedName + "_status",
      "unique_id": serverTitleSanitised + "_" + vmId + "_status",
      "device": {
        "identifiers": [serverTitleSanitised + "_" + vmSanitisedName],
        "name": serverTitleSanitised + "_VM_" + vmSanitisedName,
        "manufacturer": server.serverDetails.motherboard,
        "model": "VM"
      }
    }));
    client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName, JSON.stringify(vmDetails));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/state");
    if (!updated[ip].vms[vmId]) {
      updated[ip].vms[vmId] = {};
    }
    updated[ip].vms[vmId].details = JSON.stringify(vmDetails);
  }

  if (vm.edit && vm.edit.usbs && vm.edit.usbs.length > 0 && !disabledDevices.includes(ip + "|" + vmId + "|USBs")) {
    vm.edit.usbs.map(device => {
      if (disabledDevices.includes(ip + "|" + vmId + "|" + device.id)) {
        return;
      }
      const sanitiseUSBName = sanitise(device.name);
      const sanitiseUSBId = sanitise(device.id);

      let usbDetails = {};
      usbDetails.name = sanitiseUSBName;
      usbDetails.attached = !!device.checked;
      usbDetails.id = device.id;
      usbDetails.connected = !!device.connected;

      if (!updated[ip].vms[vmId].usbs) {
        updated[ip].vms[vmId].usbs = {};
      }

      if (updated[ip].vms[vmId].usbs[device.id] !== JSON.stringify(usbDetails)) {
        client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + vmSanitisedName + "_" + sanitiseUSBId + "/config", JSON.stringify({
          "payload_on": true,
          "payload_off": false,
          "value_template": "{{ value_json.attached }}",
          "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId,
          "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId,
          "name": serverTitleSanitised + "_VM_" + vmSanitisedName + "_USB_" + sanitiseUSBName,
          "unique_id": serverTitleSanitised + "_" + vmId + "_" + sanitiseUSBId,
          "device": {
            "identifiers": [serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBId],
            "name": serverTitleSanitised + "_VM_" + vmSanitisedName + "_USB_" + sanitiseUSBId,
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
          "name": serverTitleSanitised + "_VM_" + vmSanitisedName + "_USB_" + sanitiseUSBName + "_connected",
          "unique_id": serverTitleSanitised + "_" + vmId + "_" + sanitiseUSBId + "_connected",
          "device": {
            "identifiers": [serverTitleSanitised + "_" + vmSanitisedName + "_" + sanitiseUSBId],
            "name": serverTitleSanitised + "_VM_" + vmSanitisedName + "_USB_" + sanitiseUSBId,
            "manufacturer": sanitiseUSBName,
            "model": "USB Device"
          }
        }));
        client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId, JSON.stringify(usbDetails));
        client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + vmSanitisedName + "/" + sanitiseUSBId + "/attach");
        updated[ip].vms[vmId].usbs[device.id] = JSON.stringify(usbDetails);
      }
    });
  }
}

function getDockerDetails(client, serverTitleSanitised, disabledDevices, dockerId, ip, server) {
  if (disabledDevices.includes(ip + "|" + dockerId)) {
    return;
  }
  let docker = server.docker.details.containers[dockerId];
  if (!docker) {
    return;
  }
  docker.name = sanitise(docker.name);

  if (!updated[ip]) {
    updated[ip] = {};
  }

  if (!updated[ip].dockers) {
    updated[ip].dockers = {};
  }

  if (updated[ip].dockers[dockerId] !== JSON.stringify(docker)) {
    client.publish(process.env.MQTTBaseTopic + "/switch/" + serverTitleSanitised + "/" + docker.name + "/config", JSON.stringify({
      "payload_on": "started",
      "payload_off": "stopped",
      "value_template": "{{ value_json.status }}",
      "state_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name,
      "json_attributes_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name,
      "name": serverTitleSanitised + "_docker_" + docker.name,
      "unique_id": serverTitleSanitised + "_" + docker.name,
      "device": {
        "identifiers": [serverTitleSanitised + "_" + docker.name],
        "name": serverTitleSanitised + "_docker_" + docker.name,
        "manufacturer": server.serverDetails.motherboard,
        "model": "Docker"
      },
      "command_topic": process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name + "/dockerState"
    }));
    client.publish(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name, JSON.stringify(docker));
    client.subscribe(process.env.MQTTBaseTopic + "/" + serverTitleSanitised + "/" + docker.name + "/dockerState");
    updated[ip].dockers[dockerId] = JSON.stringify(docker);
  }
}
