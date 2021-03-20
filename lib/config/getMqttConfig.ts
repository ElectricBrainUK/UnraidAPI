export interface MqttConfiguration {
  MQTTBroker?: string | undefined;
  MQTTBaseTopic: string;
  MQTTPass?: string;
  MQTTUser?: string;
  MQTTPort: number;
  MQTTRefreshRate?: number;
}

/**
 * Extract MQTT configuration from environment variables.
 *
 * MQTTBaseTopic defaults to 'homeassistant'.
 * MQTTPort defaults to 1833.
 */
export function getMqttConfig(): MqttConfiguration {
  const {
    MQTTBroker,
    MQTTBaseTopic,
    MQTTPass,
    MQTTUser,
    MQTTPort,
    MQTTRefreshRate,
  } = process.env;

  const port = MQTTPort ? parseInt(MQTTPort) : 1883;

  return {
    MQTTBroker,
    MQTTPass,
    MQTTUser,
    MQTTBaseTopic: MQTTBaseTopic ?? 'homeassistant',
    MQTTPort: port,
    MQTTRefreshRate,
  };
}
