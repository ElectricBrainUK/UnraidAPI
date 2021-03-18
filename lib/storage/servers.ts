import fs from 'fs';
import path from 'path';
import { CONFIG_DIR, SERVERS_JSON } from 'lib/config';
import { ServerMap } from 'models/server';

/**
 * Reads in the contents of config/servers.json. Returns empty object when
 * something has gone horribly wrong.
 */
export async function parseServers(): Promise<ServerMap> {
  await checkCreateConfigDirectory();
  await checkCreateServersJson();
  const servers = await readServersJson();
  return servers;
}

/**
 * Check for the config directory and create it if not found.
 */
async function checkCreateConfigDirectory() {
  const location = path.join(__dirname, CONFIG_DIR);

  try {
    const exists = fs.existsSync(CONFIG_DIR);

    if (!exists) {
      await fs.promises.mkdir(location);
    }
  } catch {
    console.error('Unable to create config directory');
  }
}

/**
 * Check for the existence of servers.json and create if not found.
 */
async function checkCreateServersJson() {
  const location = path.join(__dirname, CONFIG_DIR, SERVERS_JSON);
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
 * Read in servers.json and parse into ServerMap object.
 */
async function readServersJson() {
  try {
    const location = path.join(__dirname, CONFIG_DIR, SERVERS_JSON);
    const data = await fs.promises.readFile(location);
    const servers = JSON.parse(data.toString());
    return servers as ServerMap;
  } catch {
    console.error(`Unable to read and/orparse ${CONFIG_DIR}/${SERVERS_JSON}`);
    return {};
  }
}
