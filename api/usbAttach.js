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

  Object.keys(servers[data.server].vm.details).forEach(vmId => {
    let vm = servers[data.server].vm.details[vmId];
    if (vm.edit && vm.edit.pcis && vm.status === "started") {
      vm.edit.usbs.forEach(usbDevice => {
        if (usbDevice.id === data.usbId && vmId !== data.id && usbDevice.checked) {
          console.log(usbDevice); //todo this is attached to another vm, need to detach
        }
      });
    }
  });

  // { template_os: 'linux',
  //   domain_persistent: '1',
  //   domain_clock: 'utc',
  //   domain_arch: 'x86_64',
  //   domain_oldname: 'Hass.io',
  //   domain_name: 'Hass.io',
  //   domain_desc: '',
  //   domain_ovmf: '1',
  //   media_cdrom: '',
  //   media_drivers: '',
  //   gpu_bios: '',
  //   nic_0_mac: '52:54:00:8a:f5:c5',
  //   vcpus: [ '0' ],
  //   disks: [ '/mnt/user/domains/HASS.io/hassos_ova-1.11.qcow2' ],
  //   shares: [ { source: '', target: '' }, { source: '', target: '' } ],
  //   usbs:
  //    [ { id: '045e:02e6',
  //        name: 'Microsoft Corp. Wireless XBox Controller Dongle' },
  //      { id: '062a:3633', name: 'MosArtCorp.' },
  //      { id: '0a5c:21ec', name: 'Broadcom Corp.' },
  //      { id: '0b05:180a',
  //        name:
  //         'ASUSTek Computer Broadcom BCM20702 Single-Chip Bluetooth 4.0 + LE' },
  //      { id: '1532:0203', name: 'Razer USA' },
  //      { id: '1e71:170e', name: 'NZXT', checked: true } ],
  //   pcis:
  //    [ { id: '00:1a.0' },
  //      { id: '00:1d.0' },
  //      { id: '02:00.2' },
  //      { id: '02:00.3' },
  //      { gpu: true, checked: true, id: 'vnc' },
  //      { gpu: true, id: '01:00.0' },
  //      { gpu: true, id: '02:00.0' },
  //      { sound: true, checked: true, id: '' },
  //      { sound: true, id: '00:1b.0' },
  //      { sound: true, id: '01:00.1' },
  //      { sound: true, id: '02:00.1' } ] }
  return requestAttach(data.server, data.id, data.usbId, servers[data.server].authToken, vmObject.edit);
}

async function requestAttach(ip, id, usb, auth, vmObject) {
  return axios({
    method: "POST",
    url: "http://" + ip + "/plugins/dynamix.vm.manager/templates/Custom.form.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    data: await buildForm(ip, auth, usb, id, vmObject),
    httpAgent: new http.Agent({ keepAlive: true })
  }).then((response) => {
    return response.data;
  }).catch(e => {
    console.log(e);
  });
}

async function buildForm(ip, auth, usb, id, vmObject) {
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

  console.log(vmObject.pcis);
  vmObject.pcis.forEach(pciDevice => {
    console.log(pciDevice);
    staticPart += "&pci%5B%5D=" + encodeURI(pciDevice.id) + (pciDevice.checked ? '' : '%23remove');
  });
  console.log(staticPart);

  vmObject.usbs.forEach(usbDevice => {
    staticPart += "&usb%5B%5D=" + encodeURI(usbDevice.id) + ((usbDevice.checked || usbDevice.id === usb) ? '' : '%23remove');
  });

  console.log(staticPart);

  return staticPart;
}