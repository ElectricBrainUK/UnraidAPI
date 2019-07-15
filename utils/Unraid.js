import axios from "axios";
import fs from "fs";
import http from "http";

export function getUnraidDetails(servers, serverAuth) {
  getServerDetails(servers, serverAuth);
  getVMs(servers, serverAuth);
  getUSBDetails(servers, serverAuth);
  getPCIDetails(servers);
}

export function getPCIDetails(servers, skipSave) {
  Object.keys(servers).forEach(ip => {
    if (servers[ip].vm && servers[ip].vm.details && Object.keys(servers[ip].vm.details).length > 0) {
      servers[ip].pciDetails = servers[ip].vm.details[Object.keys(servers[ip].vm.details)[0]].edit.pcis;
    }
    if (!skipSave) {
      updateFile(servers, ip, "pciDetails");
    }
  });
}

function getUSBDetails(servers, serverAuth) {
  Object.keys(servers).forEach(ip => {
    if (!serverAuth[ip]) {
      return;
    }
    if (servers[ip].vm && servers[ip].vm.details && Object.keys(servers[ip].vm.details).length > 0) {
      axios({
        method: "get",
        url: "http://" + ip + "/VMs/UpdateVM?uuid=" + servers[ip].vm.details[Object.keys(servers[ip].vm.details)[0]].id,
        headers: {
          "Authorization": "Basic " + serverAuth[ip]
        }
      }).then(response => {
        servers[ip].usbDetails = [];
        while (response.data.toString().includes("<label for=\"usb")) {
          let row = extractValue(response.data, "<label for=\"usb", "</label>");
          servers[ip].usbDetails.push({
            id: extractValue(row, "value=\"", "\""),
            name: extractValue(row, "/> ", " (")
          });
          response.data = response.data.replace("<label for=\"usb", "");
        }
        updateFile(servers, ip, "usbDetails");
      }).catch(e => {
        console.log("Get USB Details: Failed with status code: " + e.statusText);
      });
    }
  });
}

function getServerDetails(servers, serverAuth) {
  Object.keys(servers).forEach(async ip => {
    if (!serverAuth[ip]) {
      return;
    }
    servers[ip].serverDetails = await scrapeHTML(ip, serverAuth);

    updateFile(servers, ip, "serverDetails");
  });
}

function scrapeHTML(ip, serverAuth) {
  return axios({
    method: "get",
    url: "http://" + ip + "/Dashboard",
    headers: {
      "Authorization": "Basic " + serverAuth[ip]
    }
  }).then((response) => {
    return {
      title: extractValue(response.data, "title>", "/"),
      cpu: extractValue(response.data, "cpu_view'><td></td><td colspan='3'>", "<"),
      memory: extractValue(response.data, "Memory<br><span>", "<"),
      motherboard: extractValue(response.data, "<tr class='mb_view'><td></td><td colspan='3'>", "<"),
      diskSpace: extractValue(response.data, "title='Go to disk settings'><i class='fa fa-fw fa-cog chevron mt0'></i></a>\n" +
        "<span class='info'>", "<")
    };
  }).catch(e => {
    console.log("Get Dashboard Details: Failed with status code: " + e.statusText);
  });
}

function getVMs(servers, serverAuth) {
  Object.keys(servers).forEach(ip => {
    if (!serverAuth[ip]) {
      return;
    }
    axios({
      method: "get",
      url: "http://" + ip + "/plugins/dynamix.vm.manager/include/VMMachines.php",
      headers: {
        "Authorization": "Basic " + serverAuth[ip]
      }
    }).then(async (response) => {
      let parts = response.data.toString().split("\u0000");
      let htmlDetails = JSON.stringify(parts[0]);
      let details = parseHTML(htmlDetails);
      let extras = parts[1];
      servers[ip].vm = {};
      servers[ip].vm.details = await processVMResponse(details, ip, serverAuth[ip]);
      servers[ip].vm.extras = extras;
      updateFile(servers, ip, "vm");
    }).catch(e => {
      console.log("Get VM Details: Failed with status code: " + e.statusText);
    });
  });
}

function updateFile(servers, ip, tag) {
  let oldServers = {};
  try {
    let rawdata = fs.readFileSync("config/servers.json");
    oldServers = JSON.parse(rawdata);
  } catch (e) {
    console.log(e);
  } finally {
    if (!oldServers[ip]) {
      oldServers[ip] = {};
    }
    oldServers[ip][tag] = servers[ip][tag];
    fs.writeFileSync("config/servers.json", JSON.stringify(oldServers));
  }
}

function parseHTML(html) {
  let parsedHtml = [];
  while (isRemaining(html)) {
    let result = parseTag(html.substring(html.indexOf("<"), html.indexOf(">") + 1), html);
    html = result.remaining;
    parsedHtml.push(result.contains);
    while (isAnyClosingTag(html)) {
      html = html.substring(html.indexOf(">") + 1);
    }
  }
  return parsedHtml;
}

function isRemaining(remaining) {
  return remaining && (remaining.indexOf("<") >= 0);
}

function isAnyClosingTag(remaining) {
  return remaining && (remaining.indexOf("</") === 0);
}

function parseTag(tag, remaining) {
  remaining = remaining.replace(tag, "");
  let object = {};
  const open = processTags(tag, object);

  if (!isClosingTag(remaining, open) && isRemaining(remaining)) {
    let result = {};
    result.contains = [];
    let contentCheck = checkContents(remaining, object);
    remaining = contentCheck.remaining;
    object = contentCheck.object;
    while (hasChildren(remaining)) {
      if (remaining.indexOf("<img") === 0) {
        let img = {};
        processTags(remaining.substring(remaining.indexOf("<"), remaining.indexOf(">") + 1), img);
        result.contains.push(img);
        remaining = remaining.substring(remaining.indexOf(">") + 1);
        continue;
      }
      let child = parseTag(remaining.substring(remaining.indexOf("<"), remaining.indexOf(">") + 1), remaining);
      result.contains.push(child.contains);
      remaining = child.remaining;
      let contentCheck = checkContents(remaining, object);
      remaining = contentCheck.remaining;
      object = contentCheck.object;
    }
    if (result.remaining) {
      remaining = result.remaining;
    }
    object.children = result.contains;
  }
  if (isRemaining(remaining) && isClosingTag(remaining, open)) {
    let contentCheck = checkContents(remaining, object);
    remaining = contentCheck.remaining;
    object = contentCheck.object;
    remaining = remaining.substring(remaining.indexOf(">") + 1);
  }
  if (!isRemaining(remaining)) {
    remaining = "";
  }
  return { contains: object, remaining };
}

function processTags(tag, object) {
  tag = tag.replace(">", "");
  let tagParts = tag.split(" ");
  let open = tagParts.shift().substring(1);
  object.tags = {};
  tagParts.map(part => {
    let tags = part.split("=");
    return { name: clean(tags[0]), value: clean(tags[1]) };
  }).forEach(tag => {
    object.tags[tag.name] = tag.value;
  });
  object.tags.html = open;
  return open;
}

function clean(value) {
  if (value) {
    return value.replace(/\'/g, "");
  }
}

function isClosingTag(remaining, open) {
  return remaining.indexOf("</" + open + ">") === 0;
}

function checkContents(remaining, object) {
  if (hasContents(remaining)) {
    if (object.contents) {
      object.content += contentCheck.contents;
    } else {
      object.contents = remaining.substring(0, remaining.indexOf("<"));
    }
    remaining = remaining.substring(remaining.indexOf("<"));
  }
  return { remaining, object };
}

function hasContents(remaining) {
  return remaining.indexOf("</") !== 0 && remaining.indexOf("<") !== 0;
}

function hasChildren(remaining) {
  return remaining.indexOf("<") === 0 && remaining.indexOf("</") !== 0;
}

function processVMResponse(response, ip, auth) {
  let object = [];
  groupVmDetails(response, object);
  return simplifyResponse(object, ip, auth);
}

function groupVmDetails(response, object) {
  response.forEach(row => {
    if (row.tags["parent-id"]) {
      if (!object[row.tags["parent-id"]]) {
        object[row.tags["parent-id"]] = {};
      }
      object[row.tags["parent-id"]].parent = row;
    } else if (row.tags["child-id"]) {
      if (!object[row.tags["child-id"]]) {
        object[row.tags["child-id"]] = {};
      }
      object[row.tags["child-id"]].child = row;
    }
  });
}

async function simplifyResponse(object, ip, auth) {
  let temp = {};
  for (let i = 0; i < object.length; i++) {
    let vm = object[i];
    let newVMObject = {};
    newVMObject.name = vm.parent.children[0].children[0].children[1].children[0].contents;
    newVMObject.id = vm.parent.children[0].children[0].children[0].tags.id.replace("vm-", "");
    newVMObject.status = vm.parent.children[0].children[0].children[1].children[1].children[1].contents;
    newVMObject.icon = vm.parent.children[0].children[0].children[0].children[0].tags.src;
    newVMObject.coreCount = vm.parent.children[2].children[0].contents;
    newVMObject.ramAllocation = vm.parent.children[3].contents;
    newVMObject.hddAllocation = {};
    newVMObject.hddAllocation.all = [];
    newVMObject.hddAllocation.total = vm.parent.children[4].contents;
    vm.child.children[0].children[0].children[1].children.forEach(driveDetails => {
      let detailsArr = driveDetails.children.map(drive => {
        return drive.contents;
      });
      let details = { path: detailsArr[0], interface: detailsArr[1], allocated: detailsArr[2], used: detailsArr[3] };
      newVMObject.hddAllocation.all.push(details);
    });
    newVMObject.primaryGPU = vm.parent.children[5].contents;
    newVMObject = await gatherDetailsFromEditVM(ip, newVMObject.id, newVMObject, auth);
    temp[newVMObject.id] = newVMObject;
  }
  return temp;
}

export function getCSRFToken(server, auth) {
  return axios({
    method: "get",
    url: "http://" + server + "/Dashboard",
    headers: {
      "Authorization": "Basic " + auth
    }
  }).then(response => {
    return extractValue(response.data, "csrf_token=", "'");
  }).catch(e => {
    console.log("Get CSRF Token: Failed with status code: " + e.statusText);
  });
}

export function extractReverseValue(data, value, terminator) {
  return extractValue(data.split("").reverse().join(""), value.split("").reverse().join(""), terminator.split("").reverse().join("")).split("").reverse().join("");
}

export function extractValue(data, value, terminator) {
  let start = data.substring(data.toString().indexOf(value) + value.length);
  return start.substring(0, start.indexOf(terminator));
}

export function changeVMState(id, action, server, auth, token) {
  return axios({
    method: "POST",
    url: "http://" + server + "/plugins/dynamix.vm.manager/include/VMajax.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    data: "uuid=" + id + "&action=" + action + "&csrf_token=" + token,
    httpAgent: new http.Agent({ keepAlive: true })
  }).then((response) => {
    if (response.data.state === "running") {
      response.data.state = "started";
    }
    if (response.data.state === "shutoff") {
      response.data.state = "stopped";
    }
    return response.data;
  }).catch(e => {
    console.log("Change VM State: Failed with status code: " + e.statusText);
  });
}

export function gatherDetailsFromEditVM(ip, id, vmObject, auth) {
  if (!vmObject) {
    let rawdata = fs.readFileSync("config/servers.json");
    let servers = JSON.parse(rawdata);
    vmObject = servers[ip].vm.details[id];
  }
  return axios({
    method: "get",
    url: "http://" + ip + "/VMs/UpdateVM?uuid=" + id,
    headers: {
      "Authorization": "Basic " + auth
    }
  }).then(response => {
    return extractVMDetails(vmObject, response);
  }).catch(e => {
    console.log("Get VM Edit details: Failed with status code: " + e.statusText);
    return vmObject;
  });
}

function extractVMDetails(vmObject, response) {
  vmObject.edit = {
    template_os: extractValue(response.data, "id=\"template_os\" value=\"", "\""),
    domain_type: extractValue(response.data, "domain[type]\" value=\"", "\""),
    template_name: extractValue(response.data, "template[name]\" value=\"", "\""),
    template_icon: extractValue(response.data, "id=\"template_icon\" value=\"", "\""),
    domain_persistent: extractValue(response.data, "domain[persistent]\" value=\"", "\""),
    domain_clock: extractValue(response.data, "domain[clock]\" id=\"domain_clock\" value=\"", "\""),
    domain_arch: extractValue(response.data, "domain[arch]\" value=\"", "\""),
    domain_oldname: extractValue(response.data, "domain[oldname]\" id=\"domain_oldname\" value=\"", "\""),
    domain_name: extractValue(response.data, "placeholder=\"e.g. My Workstation\" value=\"", "\""),
    domain_desc: extractValue(response.data, "placeholder=\"description of virtual machine (optional)\" value=\"", "\""),
    domain_cpumode: extractValue(extractValue(response.data, "domain[cpumode]\" title=\"", "</td>"), "selected>", "</option>"),
    domain_mem: extractReverseValue(extractValue(response.data, "<select name=\"domain[mem]\"", "selected>"), "'", "value='"),
    domain_maxmem: extractReverseValue(extractValue(response.data, "<select name=\"domain[maxmem]\"", "selected>"), "'", "value='"),
    domain_machine: extractReverseValue(extractValue(response.data, "<select name=\"domain[machine]\"", "selected>"), "'", "value='"),
    domain_hyperv: extractReverseValue(extractValue(response.data, "<select name=\"domain[hyperv]\"", "selected>"), "'", "value='"),
    domain_usbmode: extractReverseValue(extractValue(response.data, "<select name=\"domain[usbmode]\"", "selected>"), "'", "value='"),
    domain_ovmf: extractValue(response.data, "name=\"domain[ovmf]\" value=\"", "\""),
    media_cdrom: extractValue(response.data, "name=\"media[cdrom]\" class=\"cdrom\" value=\"", "\""),
    media_cdrombus: extractReverseValue(extractValue(response.data, "<select name=\"media[cdrombus]\"", "selected>"), "'", "value='"),
    media_drivers: extractValue(response.data, "name=\"media[drivers]\" class=\"cdrom\" value=\"", "\""),
    media_driversbus: extractReverseValue(extractValue(response.data, "<select name=\"media[driversbus]\"", "selected>"), "'", "value='"),
    gpu_bios: extractValue(response.data, "=\"^[^.].*\" data-pickroot=\"/\" value=\"", "\""),//todo deprecate
    nic_0_mac: extractValue(response.data, "name=\"nic[0][mac]\" class=\"narrow\" value=\"", "\"") //todo deprecate
  };

  vmObject.edit.vcpus = [];
  while (response.data.includes("for='vcpu")) {
    let row = extractValue(response.data, "<label for='vcpu", "</label>");
    if (row.includes("checked")) {
      vmObject.edit.vcpus.push(extractValue(row, "value='", "'"));
    }
    response.data = response.data.replace("for='vcpu", "");
  }

  vmObject.edit.disks = [];
  while (response.data.includes("id=\"disk_")) {
    let row = extractValue(response.data, "id=\"disk_", ">");
    let disk = extractValue(row, "", "\"");
    let diskselect = extractReverseValue(extractValue(response.data, "<select name=\"disk[" + disk + "][select]\"", "selected>"), "'", "value='");
    let diskdriver = extractReverseValue(extractValue(response.data, "<select name=\"disk[" + disk + "][driver]\"", "selected>"), "'", "value='");
    let diskbus = extractReverseValue(extractValue(response.data, "<select name=\"disk[" + disk + "][bus]\"", "selected>"), "'", "value='");
    let disksize = extractValue(response.data, "name=\"disk[" + disk + "][size]\" value=\"", "\"");
    let diskpath = extractValue(row, "value=\"", "\"");
    if (diskpath) {
      vmObject.edit.disks.push({
        select: diskselect,
        image: diskpath,
        driver: diskdriver,
        bus: diskbus,
        size: disksize
      });
    }
    response.data = response.data.replace("id=\"disk_", "");
  }

  response.data.replace("<script type=\"text/html\" id=\"tmplShare\">\n" +
    "                                                                                <table class=\"domain_os other\">\n" +
    "                                                                                    <tr class=\"advanced\">\n" +
    "                                                                                        <td>Unraid Share:</td>", "");
  vmObject.edit.shares = [];
  while (response.data.includes("<td>Unraid Share:</td>")) {
    let sourceRow = extractValue(response.data, "<td>Unraid Share:</td>", "</td>");
    let targetRow = extractValue(response.data, "<td>Unraid Mount tag:</td>", "</td>");
    vmObject.edit.shares.push({
      source: extractValue(sourceRow, "value=\"", "\""),
      target: extractValue(targetRow, "value=\"", "\"")
    });
    response.data = response.data.replace("<td>Unraid Share:</td>", "");
  }

  vmObject.edit.usbs = [];
  let usbInfo = extractValue(response.data, "<td>USB Devices:</td>", "</td>");
  while (usbInfo.includes("value=\"")) {
    let row = extractValue(usbInfo, "value=\"", " (");
    let usb = {};
    if (row.includes("checked")) {
      usb.checked = true;
    }
    usb.id = row.substring(0, row.indexOf("\""));
    usb.name = row.substring(row.indexOf("/") + 3);
    vmObject.edit.usbs.push(usb);

    usbInfo = usbInfo.replace("value=\"", "");
  }

  vmObject.edit.pcis = [];
  while (response.data.includes(" name=\"pci[]\" id")) {
    let row = extractValue(response.data, " name=\"pci[]\" id", "/>");
    let device = {};
    device.name = extractValue(extractValue(response.data, " name=\"pci[]\" id", "/label>"), ">", "<");
    if (row.includes("checked")) {
      device.checked = true;
    }
    device.id = extractValue(row, "value=\"", "\"");
    vmObject.edit.pcis.push(device);

    response.data = response.data.replace(" name=\"pci[]\" id", "");
  }

  let gpuNo = 0;
  while (response.data.includes("<td>Graphics Card:</td>")) {
    let gpuInfo = extractValue(response.data, "<td>Graphics Card:</td>", "</td>");
    while (gpuInfo.includes("<option value='")) {
      let row = extractValue(gpuInfo, "<option value='", ">");
      let gpu = {};
      gpu.gpu = true;
      gpu.id = row.substring(0, row.indexOf("'"));
      gpu.name = extractValue(extractValue(gpuInfo, "<option value='", "/option>"), ">", "<");
      if (row.includes("selected")) {
        gpu.checked = true;
        gpu.position = gpuNo;
        if (gpuNo > 0) {
          vmObject.edit.pcis.forEach((device, index) => {
            if (device.id === gpu.id) {
              vmObject.edit.pcis.splice(index, 1);
              vmObject.edit.pcis.push(gpu);
            }
          });
        }
      }

      let gpuModel = extractValue(response.data, "<td>Graphics Card:</td>", "</table>");
      if (gpuModel.includes("<td>VNC Video Driver:</td>")) {
        gpu.model = extractReverseValue(extractValue(gpuModel, "<select name=\"gpu[" + gpuNo + "][model]\"", "selected>"), "'", "value='");
        gpu.keymap = extractReverseValue(extractValue(gpuModel, "<select name=\"gpu[" + gpuNo + "][keymap]\"", "selected>"), "'", "value='");
      }

      gpu.bios = extractReverseValue(extractValue(response.data, "<td>Graphics ROM BIOS:</td>", " name=\"gpu["), "\"", "value=\"");

      if (gpuNo === 0) {
        vmObject.edit.pcis.push(gpu);
      }

      gpuInfo = gpuInfo.replace("<option value='", "");
    }
    gpuNo++;
    response.data = response.data.replace("<td>Graphics Card:</td>", "");
  }

  let soundInfo = extractValue(response.data, "<td>Sound Card:</td>", "</td>");
  while (soundInfo.includes("<option value='")) {
    let row = extractValue(soundInfo, "<option value='", ">");
    let soundCard = {};
    soundCard.sound = true;
    soundCard.name = extractValue(extractValue(soundInfo, "<option value='", "/option>"), ">", "<");
    if (row.includes("selected")) {
      soundCard.checked = true;
    }
    soundCard.id = row.substring(0, row.indexOf("'"));
    vmObject.edit.pcis.push(soundCard);

    soundInfo = soundInfo.replace("<option value='", "");
  }

  let nicInfo = extractValue(response.data, "<table data-category=\"Network\" data-multiple=\"true\"", "</table>");
  let nicNo = 0;
  vmObject.edit.nics = [];
  while (nicInfo.includes("<td>Network MAC:</td>")) {
    let nic = {};
    nic.mac = extractValue(nicInfo, "name=\"nic[" + nicNo + "][mac]\" class=\"narrow\" value=\"", "\"");
    nic.network = extractReverseValue(extractValue(nicInfo, "name=\"nic[" + nicNo + "][network]\"", "selected>"), "'", "value='");
    vmObject.edit.nics.push(nic);

    nicInfo = nicInfo.replace("<td>Network MAC:</td>", "");
  }
  return vmObject;
}

export async function requestChange(ip, id, auth, vmObject, create) {
  return axios({
    method: "POST",
    url: "http://" + ip + "/plugins/dynamix.vm.manager/templates/Custom.form.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    data: await buildForm(ip, auth, id, vmObject, create),
    httpAgent: new http.Agent({ keepAlive: true })
  }).then((response) => {
    return response.data;
  }).catch(e => {
    console.log("Make Edit: Failed with status code: " + e.statusText);
  });
}

async function buildForm(ip, auth, id, vmObject, create) {
  let form = getStaticPart(vmObject, id, create);
  form += "&csrf_token=" + await getCSRFToken(ip, auth);
  form = getCPUPart(vmObject, form);
  form = getDiskPart(vmObject, form);
  form = getSharePart(vmObject, form);
  form = getPCIPart(vmObject, form);
  form = getUSBPart(vmObject, form);
  form = getNetworkPart(vmObject, form);
  return form;
}

export function getStaticPart(vmObject, id, create) {
  return "template%5Bos%5D=" + vmObject.template_os +
    "template%5Bname%5D=" + vmObject.template_name +
    "template%5Bicon%5D=" + vmObject.template_icon +
    "&domain%5Bpersistent%5D=" + vmObject.domain_persistent +
    "&domain%5Btype%5D=" + vmObject.domain_type +
    "&domain%5Bautostart%5D=" + 1 +
    "&domain%5Buuid%5D=" + id +
    "&domain%5Bclock%5D=" + vmObject.domain_clock +
    "&domain%5Boldname%5D=" + vmObject.domain_oldname +
    "&domain%5Bname%5D=" + vmObject.domain_name +
    "&domain%5Barch%5D=" + vmObject.domain_arch +
    "&domain%5Bdesc%5D=" + vmObject.domain_desc +
    "&domain%5Bcpumode%5D=" + vmObject.domain_cpumode +
    "&domain%5Bovmf%5D=" + vmObject.domain_ovmf +
    "&domain%5Bmem%5D=" + vmObject.domain_mem +
    "&domain%5Bmaxmem%5D=" + vmObject.domain_maxmem +
    "&domain%5Bmachine%5D=" + vmObject.domain_machine +
    "&domain%5Bhyperv%5D=" + vmObject.domain_hyperv +
    "&domain%5Busbmode%5D=" + vmObject.domain_usbmode +
    "&media%5Bcdrom%5D=" + vmObject.media_cdrom + //todo is encodeURI needed for these 4?
    "&media%5Bcdrombus%5D=" + vmObject.media_cdrombus +
    "&media%5Bdrivers%5D=" + vmObject.media_drivers +
    "&media%5Bdriversbus%5D=" + vmObject.media_driversbus +
    (create ? ("&createvm=" + 1) : ("&updatevm=" + 1)) +
    "&domain%5Bpassword%5D=";
}

export function getCPUPart(vmObject, form) {
  vmObject.vcpus.forEach(cpu => {
    form += "&domain%5Bvcpu%5D%5B%5D=" + cpu;
  });
  return form;
}

export function getDiskPart(vmObject, form) {
  vmObject.disks.forEach((disk, index) => {
    form += "&disk%5B" + index + "%5D%5Bimage%5D=" + disk.image;
    form += "&disk%5B" + index + "%5D%5Bselect%5D=" + disk.select;
    form += "&disk%5B" + index + "%5D%5Bsize%5D=" + disk.size;
    form += "&disk%5B" + index + "%5D%5Bdriver%5D=" + disk.driver;
    form += "&disk%5B" + index + "%5D%5Bbus%5D=" + disk.bus;
  });
  return form;
}

export function getSharePart(vmObject, form) {
  vmObject.shares.forEach((share, index) => {
    form += "&shares%5B" + index + "%5D%5Bsource%5D=" + share.source;
    form += "&shares%5B" + index + "%5D%5Btarget%5D=" + share.target;
  });
  return form;
}

export function getPCIPart(vmObject, form) {
  let audioDevices = 0;
  let gpus = 0;
  vmObject.pcis.forEach(pciDevice => {
    if (pciDevice.id === "vnc" || !pciDevice.id) {
      return;
    }

    if (pciDevice.gpu && pciDevice.checked) {
      form += "&gpu%5B" + gpus + "%5D%5Bid%5D=" + encodeURI(pciDevice.id);
      form += "&gpu%5B" + gpus + "%5D%5Bmodel%5D=" + encodeURI("qxl");
      form += "&gpu%5B" + gpus + "%5D%5Bkeymap%5D=" + (pciDevice.keymap ? encodeURI(pciDevice.keymap) : "");
      form += "&gpu%5B" + gpus + "%5D%5Bbios%5D=" + (pciDevice.bios ? encodeURI(pciDevice.bios) : "");
      gpus++;
    } else if (pciDevice.audio && pciDevice.checked) {
      form += "&audio%5B" + audioDevices + "%5D%5Bid%5D=" + encodeURI(pciDevice.id);
      audioDevices++;
    } else {
      form += "&pci%5B%5D=" + encodeURI(pciDevice.id) + (pciDevice.checked ? "" : "%23remove");
    }
  });
  return form;
}

export function getUSBPart(vmObject, form) {
  vmObject.usbs.forEach(usbDevice => {
    form += "&usb%5B%5D=" + encodeURI(usbDevice.id) + (usbDevice.checked ? "" : "%23remove");
  });
  return form;
}

export function getNetworkPart(vmObject, form) {
  vmObject.nics.forEach((nicDevice, index) => {
    form += "&nic%5B" + index + "%5D%5Bmac%5D=" + nicDevice.mac;
    form += "&nic%5B" + index + "%5D%5Bnetwork%5D=" + nicDevice.network;
  });
  return form;
}

export function removePCICheck(details, id) {
  details.pcis.filter(pciDevice => pciDevice.id.split(".")[0] === id.split(".")[0]).map(device => device.checked = false);
}

export function addPCICheck(details, id) {
  details.pcis.filter(pciDevice => pciDevice.id.split(".")[0] === id.split(".")[0]).map(device => device.checked = true);
}

export function flipPCICheck(details, id) {
  let check;
  details.pcis.filter(pciDevice => pciDevice.id.split(".")[0] === id.split(".")[0]).map(device => {
    device.checked = check ? check : !device.checked;
    if (!check) {
      check = device.checked;
    }
  });
}