import { MqttClient } from 'mqtt';
import { getServerDetails } from './getServerDetails';
import { keyStorageChecker } from 'lib/storage/secure';
import { getUnraidDetails } from 'lib/getUnraidDetails';
import { parseServers } from 'lib/storage/servers';
import { readDisabledDevices } from 'lib/storage/devices';
import { getMqttConfig } from 'lib/config';

export async function updateMQTT(client: MqttClient) {
  try {
    const { MQTTRefreshRate } = getMqttConfig();

    const [servers, keys, disabledDevices] = await Promise.all([
      parseServers(),
      keyStorageChecker(),
      readDisabledDevices(),
    ]);

    getUnraidDetails(servers, keys);

    let timer = 1000;
    Object.keys(servers).forEach((ip) => {
      setTimeout(
        getServerDetails,
        timer,
        client,
        servers,
        disabledDevices,
        ip,
        timer,
      );
      timer = timer + (MQTTRefreshRate ? +MQTTRefreshRate * 1000 : 20000) / 4;
    });
  } catch (e) {
    console.log(
      'The secure keys for mqtt may have not been generated, you need to make 1 authenticated request via the API first for this to work',
    );
    console.log(e);
  }
}
