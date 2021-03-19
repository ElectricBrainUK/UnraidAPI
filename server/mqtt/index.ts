import mqtt, { Packet } from 'mqtt';
import { getCSRFToken } from '../../lib/auth/getCSRFToken';
import { changeVMState } from '../../lib/vm/changeVMState';
import { changeArrayState } from '../../lib/changeArrayState';
import { changeDockerState } from '../../lib/docker/changeDockerState';
import { changeServerState } from '../../lib/changeServerState';
import fs from 'fs';
import uniqid from 'uniqid';
import { Server } from 'models/server';
import { VmDetails } from 'models/vm';
import { DockerContainer } from 'models/docker';
import { updateMQTT } from './updateMQTT';
import { mqttRepeat } from './mqttRepeat';
import { sanitise } from './sanitise';
import { getServerDetails } from './getServerDetails';
import { getDockerDetails } from './getDockerDetails';
import { getVMDetails } from './getVMDetails';
import { attachUSB, detachUSB } from '../../lib/vm/attachUSB';

let retry;

let updated = {};
let repeater;

export function startMQTTClient() {
  try {
    let haOptions = JSON.parse(
      fs.readFileSync('/data/options.json').toString()
    );
    Object.keys(haOptions).forEach((key) => {
      process.env[key] = haOptions[key];
    });
  } catch (e) {
    //do nothing
  }
  if (!process.env.MQTTBroker) {
    console.log('mqtt disabled');
    return;
  }

  this.getVMDetails = getVMDetails.bind(this);
  this.getDockerDetails = getDockerDetails.bind(this);
  this.getServerDetails = getServerDetails.bind(this);

  const options = {
    username: process.env.MQTTUser,
    password: process.env.MQTTPass,
    port: parseInt(process.env.MQTTPort),
    host: process.env.MQTTBroker,
    rejectUnauthorized: process.env.MQTTSelfSigned !== 'true'
  };
  const client = mqtt.connect(
    process.env.MQTTSecure === 'true'
      ? 'mqtts://'
      : 'mqtt://' + process.env.MQTTBroker,
    options
  );

  try {
    client.on(
      'connect',
      (packet: Packet) => {
        console.log('Connected to mqtt broker');
        client.subscribe(process.env.MQTTBaseTopic + '/bridge/state');
        updateMQTT(client);
        if (repeater) {
          repeater = clearTimeout(repeater);
        }
        mqttRepeat(client);
      }
      // todo might need to use try/catch
      // (err) => {
      //   console.log(err);
      // },
    );

    client.on('message', async (topic, message) => {
      let queryID = await uniqid.time('MQTT-R-', '');
      console.log(
        'Received MQTT Topic: ' +
        topic +
        ' and Message: ' +
        message +
        ' assigning ID: ' +
        queryID
      );

      if (topic === process.env.MQTTBaseTopic + '/bridge/state') {
        updated = {};
        console.log('Invalidating caches as the MQTT Bridge just restarted');
        console.log(queryID + ' succeeded');
        return;
      }

      let keys = JSON.parse(
        fs
          .readFileSync(
            (process.env.KeyStorage
              ? process.env.KeyStorage + '/'
              : 'secure/') + 'mqttKeys'
          )
          .toString()
      );
      let servers = JSON.parse(
        fs.readFileSync('config/servers.json').toString()
      );

      const topicParts = topic.split('/');
      let ip = '';
      let serverDetails: Server = {
        // on: true,
        serverDetails: { on: false },
        usbDetails: []
      };

      let serverTitleSanitised;
      for (let [serverIp, server] of Object.entries<Server>(servers)) {
        if (
          server.serverDetails &&
          sanitise(server.serverDetails.title) === topicParts[1]
        ) {
          serverTitleSanitised = sanitise(server.serverDetails.title);
          ip = serverIp;
          serverDetails.serverDetails = server.serverDetails;
          break;
        }
      }

      if (ip === '') {
        console.log(
          'Failed to process ' +
          queryID +
          ', servers not loaded. If the API just started this should go away after a minute, otherwise log into servers in the UI'
        );
        return;
      }
      let token = await getCSRFToken(ip, keys[ip]);

      let vmIdentifier = '';
      let vmDetails: VmDetails = {};
      let vmSanitisedName = '';
      let dockerIdentifier = '';
      let dockerDetails: DockerContainer = {};

      if (topicParts.length >= 3) {
        if (!topic.includes('docker') && serverDetails.vm) {
          Object.keys(serverDetails?.vm.details).forEach((vmId) => {
            const vm = serverDetails.vm.details[vmId];
            if (sanitise(vm.name) === topicParts[2]) {
              vmIdentifier = vmId;
              vmDetails = vm;
              vmSanitisedName = sanitise(vm.name);
            }
          });
        } else if (serverDetails.docker) {
          Object.keys(serverDetails.docker.details.containers).forEach(
            (dockerId) => {
              const docker = serverDetails.docker.details.containers[dockerId];
              if (sanitise(docker.name) === topicParts[2]) {
                dockerIdentifier = dockerId;
                dockerDetails = docker;
              }
            }
          );
        }
      }

      let responses = [];

      if (topic.toLowerCase().includes('state')) {
        let command = '';
        switch (message.toString()) {
          case 'started':
            if (
              vmDetails.status === 'paused' ||
              vmDetails.status === 'pmsuspended' ||
              dockerDetails.status === 'paused'
            ) {
              command = 'domain-resume';
            } else {
              command = 'domain-start';
            }
            break;
          case '"started"':
            if (
              vmDetails.status === 'paused' ||
              vmDetails.status === 'pmsuspended' ||
              dockerDetails.status === 'paused'
            ) {
              command = 'domain-resume';
            } else {
              command = 'domain-start';
            }
            break;
          case 'stopped':
            command = 'domain-stop';
            break;
          case '"stopped"':
            command = 'domain-stop';
            break;
          case 'paused':
            command = 'domain-pause';
            break;
          case 'kill':
            command = 'domain-destroy';
            break;
          case 'restart':
            command = 'domain-restart';
            break;
          case 'hibernate':
            command = 'domain-pmsuspend';
            break;
        }

        if (!topic.includes('docker')) {
          const vmDetailsToSend = {
            id: vmIdentifier,
            status: message.toString(),
            coreCount: vmDetails.coreCount,
            ram: vmDetails.ramAllocation,
            primaryGPU: vmDetails.primaryGPU,
            name: vmSanitisedName,
            description: vmDetails.edit.description,
            mac: vmDetails.edit.nics[0]
              ? vmDetails.edit.nics[0].mac
              : undefined
          };
          console.log('Updating MQTT for: ' + queryID);
          client.publish(
            process.env.MQTTBaseTopic +
            '/' +
            serverTitleSanitised +
            '/' +
            vmSanitisedName,
            JSON.stringify(vmDetailsToSend)
          );

          responses.push(
            await changeVMState(vmIdentifier, command, ip, keys[ip], token)
          );
        } else {
          dockerDetails.status = message.toString();
          client.publish(
            process.env.MQTTBaseTopic +
            '/' +
            serverTitleSanitised +
            '/' +
            sanitise(dockerDetails.name),
            JSON.stringify(dockerDetails)
          );
          responses.push(
            await changeDockerState(
              dockerIdentifier,
              command,
              ip,
              keys[ip],
              token
            )
          );
        }
      } else if (topic.includes('attach')) {
        let data = {
          server: ip,
          id: vmIdentifier,
          auth: keys[ip],
          usbId: topicParts[3].replace('_', ':')
        };

        if (
          message.toString() &&
          message.toString() !== 'false' &&
          message.toString() !== 'False'
        ) {
          responses.push(await attachUSB(data));
        } else {
          responses.push(await detachUSB(data));
        }
        const usbDetails = vmDetails.edit.usbs.filter(
          (usb) => sanitise(usb.id) === topicParts[3]
        )[0];
        client.publish(
          process.env.MQTTBaseTopic +
          '/' +
          serverTitleSanitised +
          '/' +
          vmSanitisedName +
          '/' +
          topicParts[3],
          JSON.stringify({
            id: topicParts[3],
            attached: message.toString().toLowerCase() !== 'false',
            name: sanitise(usbDetails.name),
            connected: !!usbDetails.connected
          })
        );
      } else if (topic.includes('array')) {
        let command = 'start';
        if (message.toString() === 'Stopped') {
          command = 'stop';
        }
        serverDetails.serverDetails.arrayStatus = message.toString();
        client.publish(
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
          JSON.stringify(serverDetails)
        );
        responses.push(await changeArrayState(command, ip, keys[ip], token));
      } else if (topic.includes('powerOff')) {
        serverDetails.serverDetails.on = false;
        client.publish(
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
          JSON.stringify(serverDetails)
        );
        responses.push(
          await changeServerState('shutdown', ip, keys[ip], token)
        );
      } else if (topic.includes('reboot')) {
        serverDetails.serverDetails.on = false;
        client.publish(
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
          JSON.stringify(serverDetails)
        );
        responses.push(await changeServerState('reboot', ip, keys[ip], token));
      } else if (topic.includes('check')) {
        if (!serverDetails.serverDetails.parityCheckRunning) {
          serverDetails.serverDetails.parityCheckRunning = true;
          client.publish(
            process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
            JSON.stringify(serverDetails)
          );
          responses.push(await changeServerState('check', ip, keys[ip], token));
        } else {
          serverDetails.serverDetails.parityCheckRunning = false;
          client.publish(
            process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
            JSON.stringify(serverDetails)
          );
          responses.push(
            await changeServerState('check-cancel', ip, keys[ip], token)
          );
        }
      } else if (topic.includes('move')) {
        serverDetails.serverDetails.moverRunning = true;
        client.publish(
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
          JSON.stringify(serverDetails)
        );
        responses.push(await changeServerState('move', ip, keys[ip], token));
      } else if (topic.includes('sleep')) {
        serverDetails.serverDetails.on = false;
        client.publish(
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
          JSON.stringify(serverDetails)
        );
        responses.push(await changeServerState('sleep', ip, keys[ip], token));
      }

      let success = true;
      responses.forEach((response) => {
        if (response && success) {
          success = !!response.success;
        } else if (!response) {
          success = false;
          console.log('Part of ' + queryID + ' failed.');
        }
        if (response && response.error) {
          success = false;
          console.log(
            'Part of ' + queryID + ' failed with response: ' + response.error
          );
        }
      });
      if (success) {
        console.log(queryID + ' succeeded');
      }
    });

    client.on('error', function(error) {
      console.log('Can\'t connect' + error);
    });
  } catch (e) {
    if (
      e.toString().includes('no such file or directory, open') &&
      e.toString().includes('mqttKeys')
    ) {
      console.log(
        'Server details failed to load. Have you set up any servers in the UI?'
      );
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
