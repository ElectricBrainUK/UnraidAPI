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
    let rawdata = fs.readFileSync("config/servers.json");
    servers = JSON.parse(rawdata);
  } catch (e) {
    console.log(e);
  } finally {
    if (data.ip) {
      servers[data.ip] = {};
    }
    if (!fs.existsSync("config/")){
      fs.mkdirSync("config/");
    }
    fs.writeFileSync("config/servers.json", JSON.stringify(servers));
    response.message = "Connected";
  }
  return response;
}
