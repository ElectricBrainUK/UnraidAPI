import axios from "axios";
import { gatherDetailsFromEditVM } from "../utils/Unraid";

export default function(req, res, next) {
  let body = [];
  let data;
  req.on("data", (chunk) => {
    body.push(chunk);
  }).on("end", async () => {
    data = JSON.parse(Buffer.concat(body).toString());
    if (data) {
      let response = {};
      response.message = await attachUSB(data);
      response.status = 200;
      res.send(response);
    }
  });
};

async function attachUSB(data) {
  let servers = await gatherDetailsFromEditVM(data.server, data.id);

  Object.keys(servers[data.server].vm.details).forEach(vmId => {
    let vm = servers[data.server].vm.details[vmId];
    if (vm.edit && vm.edit.pcis) {
      vm.edit.usbs.forEach(usbDevice => {
        if (usbDevice.id === data.usbId && vmId !== data.id) {
          console.log(usbDevice); //todo this is attached to another vm, need to detach
        }
      });
    }
  });

  //todo: attach the usb
}