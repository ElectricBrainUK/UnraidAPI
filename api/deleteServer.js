import fs from "fs";

export default function(req, res, next) {
  let body = [];
  let response = {};
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    const rawdata = fs.readFileSync("config/servers.json");
    let servers = JSON.parse(rawdata);

    const ip = Buffer.concat(body).toString();

    servers[ip] = undefined;

    fs.writeFileSync("config/servers.json", JSON.stringify(servers));

    response.status = 200;
    res.send(response);
  });
};

