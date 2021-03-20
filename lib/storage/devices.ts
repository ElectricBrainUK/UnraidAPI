import fs from 'fs';
import { CONFIG_DIR, DISABLED_DEVICES } from 'lib/config';
import path from 'path';

// TODO shape of this data?
/**
 * Write disable devices data to disk
 * @param data TBA?
 */
export async function writeDisabledDevices(data) {
  try {
    const location = path.join(CONFIG_DIR, DISABLED_DEVICES);
    const payload = JSON.stringify(data);
    await fs.promises.writeFile(location, payload);
  } catch (err) {
    console.error(`Failed to write to ${location}`);
    console.error(err);
  }
}

/**
 * Read in contents of mqttDisabledDevices.json
 * @returns TBA?
 */
export async function readDisabledDevices() {
  const location = path.join(CONFIG_DIR, DISABLED_DEVICES);
  try {
    const data = await fs.promises.readFile(location);
    const devices = await JSON.parse(data.toString());
    return devices;
  } catch (err) {
    return [];
  }
}
