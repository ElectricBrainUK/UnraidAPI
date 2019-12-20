import fs from "fs";

export default function(req, res, next) {
  let body = [];
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    data = JSON.parse(Buffer.concat(body).toString());
    if (data) {
      let response = {};
      response = { ...response, ...(await connectToServer(data)) };
      response.status = 200;
      res.send(response);
    }
  });
};

async function connectToServer(data) {
  let response = {};
  let servers = {};
  try {
    if (!fs.existsSync("config/")){
      fs.mkdirSync("config/");
    } else {
      let rawdata = fs.readFileSync("config/servers.json");
      servers = JSON.parse(rawdata);
    }
    if (!fs.existsSync(process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/")){
      fs.mkdirSync(process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/");
    }
    if (!fs.existsSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys")) {
      fs.writeFileSync(process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/mqttKeys", {});
    }
  } catch (e) {
    // console.log(e);
  } finally {
    let keys = {};
    try {
      keys = JSON.parse(fs.readFileSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys"));
    } catch (e) {
      // console.log(e);
    } finally {
      if (data.ip) {
        servers[data.ip] = {};
        keys[data.ip] = data.authToken;
        fs.writeFileSync((process.env.KeyStorage ? process.env.KeyStorage + "/" : "secure/") + "mqttKeys", JSON.stringify(keys));
      }

      fs.writeFileSync("config/servers.json", JSON.stringify(servers));
      response.message = "Connected";
    }
  }
  return response;
}
