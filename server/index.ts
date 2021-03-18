import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

import { startMQTTClient } from './mqtt/index';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  startMQTTClient();
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(process.env.PORT ? process.env.PORT : 3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
