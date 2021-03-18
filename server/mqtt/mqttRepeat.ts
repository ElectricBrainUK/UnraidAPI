import { MqttClient } from 'mqtt';
import { updateMQTT } from './updateMQTT';

let repeater: NodeJS.Timeout;
let count = 0;
let updated = {};
export function mqttRepeat(client: MqttClient) {
  repeater = setTimeout(
    () => {
      count++;
      if (
        count >
        (60 /
          (process.env.MQTTRefreshRate
            ? parseInt(process.env.MQTTRefreshRate)
            : 20)) *
          (process.env.MQTTCacheTime ? parseInt(process.env.MQTTCacheTime) : 60)
      ) {
        count = 0;
        updated = {};
      }
      updateMQTT(client);
      mqttRepeat(client);
    },
    process.env.MQTTRefreshRate
      ? parseInt(process.env.MQTTRefreshRate) * 1000
      : 20000,
  );
}
