import axios from "axios";
import { gatherDetailsFromEditVM, getCSRFToken } from "../utils/Unraid";
import fs from "fs";
import http from "http";

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
  let vmObject = await gatherDetailsFromEditVM(data.server, data.id);
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let attached = {};

  Object.keys(servers[data.server].vm.details).forEach(vmId => {
    let vm = servers[data.server].vm.details[vmId];
    if (vm.edit && vm.edit.pcis && vm.status === "started") {
      vm.edit.usbs.forEach(usbDevice => {
        if (usbDevice.id === data.usbId && vmId !== data.id && usbDevice.checked) {
          attached = {usbId: usbDevice.id, vmId, vm};
        }
      });
    }
  });

  if (attached) {
    await requestAttach(data.server, attached.vmId, attached.usbId, servers[data.server].authToken, attached.vm.edit, true);
  }

  return requestAttach(data.server, data.id, data.usbId, servers[data.server].authToken, vmObject.edit);
}

async function requestAttach(ip, id, usb, auth, vmObject, detach) {
  return axios({
    method: "POST",
    url: "http://" + ip + "/plugins/dynamix.vm.manager/templates/Custom.form.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    data: await buildForm(ip, auth, usb, id, vmObject, detach),
    httpAgent: new http.Agent({ keepAlive: true })
  }).then((response) => {
    return response.data;
  }).catch(e => {
    console.log(e);
  });
}

async function buildForm(ip, auth, usb, id, vmObject, detach) {
  let staticPart = "template%5Bos%5D=" + vmObject.template_os +
    "&domain%5Bpersistent%5D=" + vmObject.domain_persistent +
    "&domain%5Buuid%5D=" + id +
    "&domain%5Bclock%5D=" + vmObject.domain_clock +
    "&domain%5Boldname%5D=" + vmObject.domain_oldname +
    "&domain%5Bname%5D=" + vmObject.domain_name +
    "&domain%5Bdesc%5D=" + vmObject.domain_desc +
    "&domain%5Bovmf%5D=" + vmObject.domain_ovmf +
    "&media%5Bcdrom%5D=" + vmObject.media_cdrom +
    "&media%5Bdrivers%5D=" + vmObject.media_drivers +
    "&gpu%5B0%5D%5Brom%5D=" + vmObject.gpu_bios +
    "&nic%5B0%5D%5Bmac%5D=" + vmObject.nic_0_mac +
    "&updatevm=" + 1 +
    "&domain%5Bpassword%5D=" +
    "&csrf_token=" + await getCSRFToken(ip, auth);

  vmObject.vcpus.forEach(cpu => {
    staticPart += "&domain%5Bvcpu%5D%5B%5D=" + cpu;
  });

  vmObject.disks.forEach((disk, index) => {
    staticPart += "&disk%5B" + index + "%5D%5Bimage%5D=" + disk + "&disk%5B0%5D%5Bsize%5D=";
  });

  vmObject.shares.forEach((share, index) => {
    staticPart += "&shares%5B" + index + "%5D%5Bsource%5D=" + share.source;
    staticPart += "&shares%5B" + index + "%5D%5Btarget%5D=" + share.target;
  });

  vmObject.pcis.forEach(pciDevice => {
    staticPart += "&pci%5B%5D=" + encodeURI(pciDevice.id) + (pciDevice.checked ? '' : '%23remove');
  });

  vmObject.usbs.forEach(usbDevice => {
    let condition = (usbDevice.checked || usbDevice.id === usb);
    if (detach) {
      condition = (usbDevice.checked && usbDevice.id !== usb);
    }
    staticPart += "&usb%5B%5D=" + encodeURI(usbDevice.id) + (condition ? '' : '%23remove');
  });

  return staticPart;
}