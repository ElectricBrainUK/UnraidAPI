import { sanitise } from './sanitise';

let updated: Record<string, any> = {};

export function getDockerDetails(
  client,
  serverTitleSanitised,
  disabledDevices,
  dockerId,
  ip,
  server,
) {
  if (disabledDevices.includes(ip + '|' + dockerId)) {
    return;
  }
  if (
    !server ||
    !server.docker ||
    !server.docker.details ||
    !server.docker.details.containers
  ) {
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
    client.publish(
      process.env.MQTTBaseTopic +
        '/switch/' +
        serverTitleSanitised +
        '/' +
        docker.name +
        '/config',
      JSON.stringify({
        payload_on: 'started',
        payload_off: 'stopped',
        value_template: '{{ value_json.status }}',
        state_topic:
          process.env.MQTTBaseTopic +
          '/' +
          serverTitleSanitised +
          '/' +
          docker.name,
        json_attributes_topic:
          process.env.MQTTBaseTopic +
          '/' +
          serverTitleSanitised +
          '/' +
          docker.name,
        name: serverTitleSanitised + '_docker_' + docker.name,
        unique_id: serverTitleSanitised + '_' + docker.name,
        device: {
          identifiers: [serverTitleSanitised + '_' + docker.name],
          name: serverTitleSanitised + '_docker_' + docker.name,
          manufacturer: server.serverDetails.motherboard,
          model: 'Docker',
        },
        command_topic:
          process.env.MQTTBaseTopic +
          '/' +
          serverTitleSanitised +
          '/' +
          docker.name +
          '/dockerState',
      }),
    );
    client.publish(
      process.env.MQTTBaseTopic +
        '/' +
        serverTitleSanitised +
        '/' +
        docker.name,
      JSON.stringify(docker),
    );
    client.subscribe(
      process.env.MQTTBaseTopic +
        '/' +
        serverTitleSanitised +
        '/' +
        docker.name +
        '/dockerState',
    );
    updated[ip].dockers[dockerId] = JSON.stringify(docker);
  }
}
