import axios from "axios";

export default function(req, res, next) {
  let body = [];
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    data = JSON.parse(Buffer.concat(body).toString());
    if (data) {
      let response = {};
      response.message = attachUSB(data);
      response.status = 200;
      res.send(response);
    }
  });
};

function attachUSB(data) {

}