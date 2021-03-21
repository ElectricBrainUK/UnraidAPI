import { getMqttConfig } from 'lib/config';
import { MqttClient } from 'mqtt';
import { updateMQTT } from './updateMQTT';

let repeater: NodeJS.Timeout;
let count = 0;
let updated = {};
export function mqttRepeat(client: MqttClient) {
  const { MQTTRefreshRate } = getMqttConfig();

  repeater = setTimeout(
    () => {
      count++;
      if (
        count >
        (60 / (MQTTRefreshRate ? parseInt(MQTTRefreshRate) : 20)) *
          (process.env.MQTTCacheTime ? parseInt(process.env.MQTTCacheTime) : 60)
      ) {
        count = 0;
        updated = {};
      }
      updateMQTT(client);
      mqttRepeat(client);
    },
    MQTTRefreshRate ? parseInt(MQTTRefreshRate) * 1000 : 20000,
  );
}
