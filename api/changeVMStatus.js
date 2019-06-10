import fs from "fs";
import axios from "axios";
import http from "http";

export default function(req, res, next) {
  let body = [];
  let response = {};
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    data = JSON.parse(Buffer.concat(body).toString());
    if (data) {
      let servers = JSON.parse(fs.readFileSync("config/servers.json"));
      let auth = servers[data.server].authToken;
      let token = await getCSRFToken(data.server, auth);
      response.message = await changeVMState(data.id, data.action, data.server, auth, token);
      response.status = 200;
      res.send(response);
    }
  });
};

function getCSRFToken(server, auth) {
  return axios({
    method: "get",
    url: "http://" + server + "/plugins/preclear.disk/Preclear.php?action=get_csrf_token",
    headers: {
      "Authorization": "Basic " + auth
    }
  }).then(response => {
    return response.data.csrf_token;
  }).catch(e => {
    console.log(e);
  });
}

function changeVMState(id, action, server, auth, token) {
  return axios({
    method: "POST",
    url: "http://" + server + "/plugins/dynamix.vm.manager/include/VMajax.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    data: "uuid=" +  id + "&action=" + action + "&csrf_token=" + token,
    httpAgent: new http.Agent({ keepAlive: true }),
  }).then((response) => {
    if (response.data.state === 'running') {
      response.data.state = 'started';
    }
    if (response.data.state === 'shutoff') {
      response.data.state = 'stopped';
    }
    return response.data;
  }).catch(e => {
    console.log(e);
  });
}