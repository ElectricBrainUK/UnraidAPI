import axios from 'axios';
import https from 'https';
import fetch from 'node-fetch';

axios.defaults.withCredentials = true;
axios.defaults.httpsAgent = new https.Agent({
  keepAlive: true,
  rejectUnauthorized: false,
});
