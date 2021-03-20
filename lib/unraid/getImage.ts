import fetch from 'node-fetch';
import { logIn } from './logIn';
import { authCookies } from '../auth';
import { ServerMap } from 'models/server';
import { readMqttKeys } from 'lib/storage/secure';

export async function getImage(servers: ServerMap, res, path: string) {
  const serverAuth = await readMqttKeys();
  await logIn(servers, serverAuth);
  let sent = false;

  Object.keys(servers).forEach((server) => {
    const urlBase = server.includes('http') ? server : 'http://' + server;
    const basePath = path.includes('plugins') ? '/state' : '/plugins';
    fetch(urlBase + basePath + path, {
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + serverAuth[server],
        Cookie: authCookies[server] ? authCookies[server] : '',
        'content-type': 'image/png',
      },
    })
      .then((image) => image.buffer())
      .then((buffer) => {
        if (buffer.toString().includes('<!DOCTYPE html>')) {
          return;
        }
        if (!sent) {
          sent = true;
          try {
            res.set({ 'content-type': 'image/png' });
            res.send(buffer);
          } catch (e) {}
        }
      })
      .catch((err) => {
        // console.log(err);
      });
  });
}
