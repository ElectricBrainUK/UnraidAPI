import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

import { startMQTTClient } from './mqtt/index';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const handle = app.getRequestHandler();

// TODO Consider using module-alias for transpiled server to use nice imports or
// maybe use webpack and ts-loader with tsconfigpaths plugin.

app.prepare().then(() => {
  startMQTTClient();
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
