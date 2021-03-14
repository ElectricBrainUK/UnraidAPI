import fs from 'fs';
import fetch from 'node-fetch';
import { logIn } from './logIn';
import { authCookies } from '../auth';
import { ServerMap } from './types';

export async function getImage(servers: ServerMap, res, path) {
  let serverAuth = JSON.parse(
    fs
      .readFileSync(
        (process.env.KeyStorage ? process.env.KeyStorage + '/' : 'secure/') +
          'mqttKeys',
      )
      .toString(),
  );
  await logIn(servers, serverAuth);
  let sent = false;

  Object.keys(servers).forEach((server) => {
    fetch(
      (server.includes('http') ? server : 'http://' + server) +
        (path.includes('plugins') ? '/state' : '/plugins') +
        path,
      {
        method: 'get',
        headers: {
          Authorization: 'Basic ' + serverAuth[server],
          Cookie: authCookies[server] ? authCookies[server] : '',
          'content-type': 'image/png',
        },
      },
    )
      .then((image) => {
        image.buffer().then((buffer) => {
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
        });
      })
      .catch((err) => {
        // console.log(err);
      });
  });
}
