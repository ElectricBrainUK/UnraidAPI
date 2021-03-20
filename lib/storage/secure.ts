import fs from 'fs';
import path from 'path';
import { getKeyStorage, MQTT_KEYS } from 'lib/config';
import { MqttKeyMap } from 'models/mqtt';

/**
 * Create necessary directories and files if they do not exist and return Mqtt
 * key map. Defaults to returning empty object if something fails horribly.
 * @returns parsed Mqtt key map
 */
export async function keyStorageChecker(): Promise<MqttKeyMap> {
  await checkCreateSecureDirectory();
  await checkCreateMqttKeys();
  const keys = await readMqttKeys();
  return keys;
}

/**
 * Check for the existence of the key storage directory and create it if it does
 * not exist.
 */
async function checkCreateSecureDirectory() {
  const keyStorage = getKeyStorage();

  const location = path.join(keyStorage);

  try {
    const exists = fs.existsSync(keyStorage);

    if (!exists) {
      await fs.promises.mkdir(location);
    }
  } catch {
    console.error('Unable to create config directory');
  }
}

/**
 * Check for the presence of the mqttKeys file, create initial file if does not
 * exist.
 */
async function checkCreateMqttKeys() {
  const keyStorage = getKeyStorage();

  const location = path.join(keyStorage, MQTT_KEYS);

  try {
    const exists = await fs.promises.stat(location);

    if (!exists) {
      await fs.promises.writeFile(location, JSON.stringify({}));
    }
  } catch {
    console.error(`${location} does not exist or was not able to be created`);
  }
}

/**
 * Read the contents of the mqttKeys file and return. Defaults to empty object
 * if error thrown.
 * @returns Mqtt Key Map
 */
async function readMqttKeys(): Promise<MqttKeyMap> {
  const keyStorage = getKeyStorage();

  const location = path.join(keyStorage, MQTT_KEYS);

  try {
    const data = await fs.promises.readFile(location);
    const mqttKeys = JSON.parse(data.toString());
    return mqttKeys as MqttKeyMap;
  } catch {
    console.error(`Unable to read and/orparse ${keyStorage}/${MQTT_KEYS}`);
    return {};
  }
}

/**
 * Write the contents of the provided key map to the mqttKeys file.
 * @param keys Mqtt Key Map
 */
export async function writeMqttKeys(keys: MqttKeyMap): Promise<void> {
  try {
    const keyStorage = getKeyStorage();

    const location = path.join(keyStorage, MQTT_KEYS);

    const data = JSON.stringify(keys);

    await fs.promises.writeFile(location, data);
  } catch (err) {
    console.error(`Failed to write mqtt keys to ${location}.`);
    console.error(err);
  }
}
