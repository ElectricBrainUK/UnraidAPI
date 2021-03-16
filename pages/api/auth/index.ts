import fs from 'fs';
import { NextApiResponse } from 'next';
import { ApiBodyRequest, LoginBody } from 'models/api/';

export default async function (
  req: ApiBodyRequest<LoginBody>,
  res: NextApiResponse,
) {
  const response = await connectToServer(req.body);
  res.send(response);
}

const CONFIG_DIR = 'config/';
const KEY_STORAGE = process.env.KeyStorage
  ? process.env.KeyStorage + '/'
  : 'secure/';

const MQTT_KEYS_DIR = `${KEY_STORAGE}mqttKeys`;

function checkConfigDir(): any {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR);
  } else {
    const rawdata = fs.readFileSync(`${CONFIG_DIR}servers.json`);
    const servers = JSON.parse(rawdata.toString());
    return servers;
  }
}

function checkKeyStorageDir() {
  if (!fs.existsSync(KEY_STORAGE)) {
    fs.mkdirSync(KEY_STORAGE);
  }
}

function checkMqttKeysDir() {
  if (!fs.existsSync(MQTT_KEYS_DIR)) {
    fs.writeFileSync(MQTT_KEYS_DIR, '');
  }
}

async function connectToServer(data: LoginBody) {
  let response = {
    message: '',
  };
  let servers = {};

  try {
    servers = checkConfigDir();
    checkKeyStorageDir();
    checkMqttKeysDir();
  } catch (e) {
    // console.log(e);
  } finally {
    let keys = {};
    try {
      keys = JSON.parse(fs.readFileSync(`${KEY_STORAGE}mqttKeys`).toString());
    } catch (e) {
      // console.log(e);
    } finally {
      servers[data.ip] = {};
      const authToken = Buffer.from(`${data.user}:${data.password}`).toString();
      keys[data.ip] = authToken;

      fs.writeFileSync(`${KEY_STORAGE}mqttKeys`, JSON.stringify(keys));

      fs.writeFileSync('config/servers.json', JSON.stringify(servers));
      response.message = 'Connected';
    }
  }
  return response;
}
