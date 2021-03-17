import { MqttClient } from 'mqtt';
import { sanitise } from './sanitise';
import { getVMDetails, getDockerDetails } from './index';

let updated: Record<string, any> = {};
export function getServerDetails(
  client: MqttClient,
  servers,
  disabledDevices,
  ip: string,
  timer,
) {
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
      identifiers: [serverTitleSanitised],
      name: serverTitleSanitised + '_server',
      manufacturer: server.serverDetails.motherboard,
      model: 'Unraid Server',
    };
    client.publish(
      process.env.MQTTBaseTopic +
        '/binary_sensor/' +
        serverTitleSanitised +
        '/config',
      JSON.stringify({
        payload_on: true,
        payload_off: false,
        value_template: '{{ value_json.on }}',
        state_topic: process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        json_attributes_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        name: serverTitleSanitised + '_server',
        unique_id: serverTitleSanitised + ' unraid api server',
        device: serverDevice,
      }),
    );
    client.publish(
      process.env.MQTTBaseTopic + '/switch/' + serverTitleSanitised + '/config',
      JSON.stringify({
        payload_on: 'Started',
        payload_off: 'Stopped',
        value_template: '{{ value_json.arrayStatus }}',
        state_topic: process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        json_attributes_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        name: serverTitleSanitised + '_array',
        unique_id: serverTitleSanitised + ' unraid api array',
        device: serverDevice,
        command_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/array',
      }),
    );
    client.subscribe(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/array',
    );

    client.publish(
      process.env.MQTTBaseTopic +
        '/switch/' +
        serverTitleSanitised +
        '/powerOff/config',
      JSON.stringify({
        payload_on: false,
        payload_off: true,
        value_template: '{{ value_json.on }}',
        state_topic: process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        name: serverTitleSanitised + '_power_off',
        unique_id: serverTitleSanitised + ' unraid server power off',
        device: serverDevice,
        command_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/powerOff',
      }),
    );
    client.subscribe(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/powerOff',
    );

    client.publish(
      process.env.MQTTBaseTopic +
        '/switch/' +
        serverTitleSanitised +
        '/reboot/config',
      JSON.stringify({
        payload_on: false,
        payload_off: true,
        value_template: '{{ value_json.on }}',
        state_topic: process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        name: serverTitleSanitised + '_reboot',
        unique_id: serverTitleSanitised + ' unraid server reboot',
        device: serverDevice,
        command_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/reboot',
      }),
    );
    client.subscribe(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/reboot',
    );

    client.publish(
      process.env.MQTTBaseTopic +
        '/switch/' +
        serverTitleSanitised +
        '/parityCheck/config',
      JSON.stringify({
        payload_on: true,
        payload_off: false,
        value_template: '{{ value_json.parityCheckRunning }}',
        state_topic: process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        name: serverTitleSanitised + '_partityCheck',
        unique_id: serverTitleSanitised + ' unraid server parity check',
        device: serverDevice,
        command_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/check',
      }),
    );
    client.subscribe(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/check',
    );

    client.publish(
      process.env.MQTTBaseTopic +
        '/switch/' +
        serverTitleSanitised +
        '/mover/config',
      JSON.stringify({
        payload_on: true,
        payload_off: false,
        value_template: '{{ value_json.moverRunning }}',
        state_topic: process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
        name: serverTitleSanitised + '_mover',
        unique_id: serverTitleSanitised + ' unraid server mover',
        device: serverDevice,
        command_topic:
          process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/move',
      }),
    );
    client.subscribe(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/move',
    );
    client.subscribe(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised + '/sleep',
    );

    client.publish(
      process.env.MQTTBaseTopic + '/' + serverTitleSanitised,
      JSON.stringify(server.serverDetails),
    );
    updated[ip].details = JSON.stringify(server.serverDetails);
  }

  if (
    server.vm &&
    server.vm.details &&
    !disabledDevices.includes(ip + '|VMs')
  ) {
    Object.keys(server.vm.details).forEach((vmId) => {
      let vm = server.vm.details[vmId];
      setTimeout(
        getVMDetails,
        timer,
        client,
        vm,
        disabledDevices,
        vmId,
        serverTitleSanitised,
        ip,
        server,
      );
      timer =
        timer +
        (process.env.MQTTRefreshRate
          ? parseInt(process.env.MQTTRefreshRate) * 1000
          : 20000) /
          20;
    });
  }

  if (
    server.docker &&
    server.docker.details &&
    !disabledDevices.includes(ip + '|Dockers')
  ) {
    Object.keys(server.docker.details.containers).forEach((dockerId) => {
      setTimeout(
        getDockerDetails,
        timer,
        client,
        serverTitleSanitised,
        disabledDevices,
        dockerId,
        ip,
        server,
      );
      timer =
        timer +
        (process.env.MQTTRefreshRate
          ? parseInt(process.env.MQTTRefreshRate) * 1000
          : 20000) /
          20;
    });
  }
}
