import fs from "fs";

export default function(req, res, next) {
  let body = [];
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    try {
      data = JSON.parse(Buffer.concat(body).toString());
      if (data) {
        let response = {};
        storeDevices(data);
        response.message = "Success";
        response.status = 200;
        res.send(response);
      }
    } catch (e) {
      res.send(fs.readFileSync("config/mqttDisabledDevices.json"));
    }
  });
};

function storeDevices(data) {
  fs.writeFileSync("config/mqttDisabledDevices.json", JSON.stringify(data));
}
