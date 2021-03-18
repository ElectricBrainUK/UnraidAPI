import fs from 'fs';
import path from 'path';
import { getKeyStorage, MQTT_KEYS } from 'lib/config';

export async function keyStorageChecker() {
  await checkCreateSecureDirectory();
  await checkCreateMqttKeys();
  const keys = await readMqttKeys();
  return keys;
}

async function checkCreateSecureDirectory() {
  const keyStorage = getKeyStorage();

  const location = path.join(__dirname, keyStorage);

  try {
    const exists = fs.existsSync(keyStorage);

    if (!exists) {
      await fs.promises.mkdir(location);
    }
  } catch {
    console.error('Unable to create config directory');
  }
}

async function checkCreateMqttKeys() {
  const keyStorage = getKeyStorage();

  const location = path.join(__dirname, keyStorage, MQTT_KEYS);

  try {
    const exists = await fs.promises.stat(location);

    if (!exists) {
      await fs.promises.writeFile(location, JSON.stringify({}));
    }
  } catch {
    console.error(`${location} does not exist or was not able to be created`);
  }
}

async function readMqttKeys() {
  const keyStorage = getKeyStorage();

  const location = path.join(__dirname, keyStorage, MQTT_KEYS);

  try {
    const data = await fs.promises.readFile(location);
    const servers = JSON.parse(data.toString());
    return servers;
  } catch {
    console.error(`Unable to read and/orparse ${keyStorage}/${MQTT_KEYS}`);
    return {};
  }
}
