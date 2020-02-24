import axios from "axios";
import fs from "fs";
import http from "http";
import https from "https";

const FormData = require("form-data");

axios.defaults.withCredentials = true;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true, rejectUnauthorized: false });

let authCookies = {};

export function getUnraidDetails(servers, serverAuth) {
  logIn(servers, serverAuth);
  getServerDetails(servers, serverAuth);
  getVMs(servers, serverAuth);
  getDockers(servers, serverAuth);
  getUSBDetails(servers, serverAuth);
  getPCIDetails(servers);
}

function logIn(servers, serverAuth) {
  Object.keys(servers).forEach(ip => {
    if (!serverAuth[ip] || authCookies[ip]) {
      return;
    }
    const buff = Buffer.from(serverAuth[ip], "base64");

    let details = buff.toString("ascii");

    let data = new FormData();
    data.append("username", details.substring(0, details.indexOf(":")));
    data.append("password", details.substring(details.indexOf(":") + 1));

    logInToUrl((ip.includes("http") ? ip : "http://" + ip) + "/login", data, ip);
  });
}

function logInToUrl(url, data, ip) {
  axios({
    url,
    method: "POST",
    data,
    headers: {
      ...data.getHeaders(),
      "cache-control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    httpAgent: new http.Agent({ keepAlive: true }),
    maxRedirects: 0
  }).then(response => {
    authCookies[ip] = response.headers["set-cookie"][0];
  }).catch(error => {
    if (error.response && error.response.headers["set-cookie"] && error.response.headers["set-cookie"][0]) {
      authCookies[ip] = error.response.headers["set-cookie"][0];
    } else if (error.response && error.response.headers.location) {
      callFailed(ip);
      logInToUrl(error.response.headers.location, data, error.response.headers.location);
    }
  });
}

export function getPCIDetails(servers, skipSave) {
  Object.keys(servers).forEach(ip => {
    if (servers[ip].vm && servers[ip].vm.details && Object.keys(servers[ip].vm.details).length > 0 && servers[ip].vm.details[Object.keys(servers[ip].vm.details)[0]].edit) {
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
        url: (ip.includes("http") ? ip : "http://" + ip) + "/VMs/UpdateVM?uuid=" + servers[ip].vm.details[Object.keys(servers[ip].vm.details)[0]].id,
        headers: {
          "Authorization": "Basic " + serverAuth[ip],
          "Cookie": authCookies[ip] ? authCookies[ip] : ""
        }
      }).then(response => {
        servers[ip].status = "online";
        updateFile(servers, ip, "status");

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
        console.log("Get USB Details for ip: " + ip + " Failed with status code: " + e.statusText);
        callFailed(ip);
        console.log(e.message);
        if (e.message.includes("ETIMEDOUT")) {
          servers[ip].status = "offline";
          updateFile(servers, ip, "status");
        }
      });
    }
  });
}

function getServerDetails(servers, serverAuth) {
  Object.keys(servers).forEach(async ip => {
    if (!serverAuth[ip]) {
      return;
    }
    servers[ip].serverDetails = await scrapeHTML(ip, serverAuth) || servers[ip].serverDetails;
    servers[ip].serverDetails = { ...await scrapeMainHTML(ip, serverAuth), ...servers[ip].serverDetails } || servers[ip].serverDetails;

    servers[ip].serverDetails.on = !!servers[ip].status;

    updateFile(servers, ip, "serverDetails");
  });
}

function scrapeHTML(ip, serverAuth) {
  return axios({
    method: "get",
    url: (ip.includes("http") ? ip : "http://" + ip) + "/Dashboard",
    headers: {
      "Authorization": "Basic " + serverAuth[ip],
      "Cookie": authCookies[ip] ? authCookies[ip] : ""
    }
  }).then((response) => {
    return {
      title: extractValue(response.data, "title>", "/"),
      cpu: extractReverseValue(extractValue(response.data, "cpu_view'>", "</tr"), "<br>", ">"),
      memory: extractValue(response.data, "Memory<br><span>", "<"),
      motherboard: extractValue(response.data, "<tr class='mb_view'><td></td><td colspan='3'>", "<"),
      diskSpace: extractValue(response.data, "title='Go to disk settings'><i class='fa fa-fw fa-cog chevron mt0'></i></a>\n" +
        "<span class='info'>", "<")
    };
  }).catch(e => {
    console.log("Get Dashboard Details for ip: " + ip + " Failed with status code: " + e.statusText);
    callFailed(ip);
    console.log(e.message);
  });
}

function scrapeMainHTML(ip, serverAuth) {
  return axios({
    method: "get",
    url: (ip.includes("http") ? ip : "http://" + ip) + "/Main",
    headers: {
      "Authorization": "Basic " + serverAuth[ip],
      "Cookie": authCookies[ip] ? authCookies[ip] : ""
    }
  }).then((response) => {
    let protection = extractValue(response.data, "</td></tr>\n          <tr><td>", "</td><td>");
    return {
      arrayStatus: extractReverseValue(extractValue(response.data, "<table class=\"array_status\">", "/span>"), "<", ">").split(",")[0],
      arrayProtection: protection.includes(">") ? undefined : protection
    };
  }).catch(e => {
    console.log("Get Main Details for ip: " + ip + " Failed with status code: " + e.statusText);
    callFailed(ip);
    console.log(e.message);
  });
}

function getVMs(servers, serverAuth) {
  Object.keys(servers).forEach(ip => {
    if (!serverAuth[ip]) {
      return;
    }
    axios({
      method: "get",
      url: (ip.includes("http") ? ip : "http://" + ip) + "/plugins/dynamix.vm.manager/include/VMMachines.php",
      headers: {
        "Authorization": "Basic " + serverAuth[ip],
        "Cookie": authCookies[ip] ? authCookies[ip] : ""
      }
    }).then(async (response) => {
      servers[ip].vm = {};
      let htmlDetails;
      if (response.data.toString().includes("\u0000")) {
        let parts = response.data.toString().split("\u0000");
        htmlDetails = JSON.stringify(parts[0]);

        servers[ip].vm.extras = parts[1];
      } else {
        htmlDetails = response.data.toString();
      }

      let details = parseHTML(htmlDetails);
      servers[ip].vm.details = await processVMResponse(details, ip, serverAuth[ip]);
      updateFile(servers, ip, "vm");
    }).catch(e => {
      console.log("Get VM Details for ip: " + ip + " Failed with status code: " + e.statusText);
      callFailed(ip);
      console.log(e.message);
    });
  });
}

function processDockerResponse(details) {
  let images = {};
  let containers = {};
  details.forEach(row => {
    if (!row.content || !row.content.includes("undefined")) {
      let docker = {};
      row.children.forEach((child, index) => {
        try {
          if (child.tags.class) {
            switch (child.tags.class) {
              case "ct-name":
                docker.imageUrl = child.children[0].children[0].children[0].tags.src.split("?")[0];
                docker.name = child.children[0].children[1].children[0].children[0].contents;
                docker.status = child.children[0].children[1].children[1].children[1].contents;
                docker.containerId = child.children[1].contents.replace("Container ID: ", "");
                break;
              case "updatecolumn":
                if (child.children[2].contents) {
                  docker.tag = child.children[2].contents.trim();
                }
                if (child.children[0].contents) {
                  docker.uptoDate = child.children[0].contents.trim();
                }
                break;
            }
            if (docker.containerId) {
              containers[docker.containerId] = docker;
            }
          } else {
            switch (index) {
              case 0:
                docker.imageUrl = child.children[0].children[0].children[0].tags.src;
                break;
              case 1:
                docker.imageId = child.contents.replace("Image ID: ", "");
                break;
              case 2:
                if (child.contents.includes("Created")) {
                  docker.created = child.contents;
                }
                break;
            }
            if (docker.imageId) {
              images[docker.imageId] = docker;
            }
          }
        } catch (e) {
          console.log("There was a problem retrieving a field for a docker image");
          console.log(e.message);
        }
      });
    }
  });
  return { images, containers };
}

function getDockers(servers, serverAuth) {
  Object.keys(servers).forEach(ip => {
    if (!serverAuth[ip]) {
      return;
    }
    axios({
      method: "get",
      url: (ip.includes("http") ? ip : "http://" + ip) + "/plugins/dynamix.docker.manager/include/DockerContainers.php",
      headers: {
        "Authorization": "Basic " + serverAuth[ip],
        "Cookie": authCookies[ip] ? authCookies[ip] : ""
      }
    }).then(async (response) => {
      let htmlDetails = JSON.stringify(response.data);
      let details = parseHTML(htmlDetails);
      servers[ip].docker = {};
      servers[ip].docker.details = await processDockerResponse(details);
      updateFile(servers, ip, "docker");
    }).catch(e => {
      console.log("Get Docker Details for ip: " + ip + " Failed with status code: " + e.statusText);
      callFailed(ip);
      console.log(e.message);
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
  if (tagParts && tagParts.length > 0) {
    tagParts.map(part => {
      let tags = part.split("=");
      return { name: clean(tags[0]), value: clean(tags[1]) };
    }).forEach(tag => {
      object.tags[tag.name] = tag.value;
    });
  }
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
      object.content += object.contents;
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
    if (vm.child.children[0].children[0].children[1].children) {
      vm.child.children[0].children[0].children[1].children.forEach(driveDetails => {
        let detailsArr = driveDetails.children.map(drive => {
          return drive.contents;
        });
        let details = { path: detailsArr[0], interface: detailsArr[1], allocated: detailsArr[2], used: detailsArr[3] };
        newVMObject.hddAllocation.all.push(details);
      });
    }
    newVMObject.primaryGPU = vm.parent.children[5].contents;
    newVMObject = await gatherDetailsFromEditVM(ip, newVMObject.id, newVMObject, auth);
    temp[newVMObject.id] = newVMObject;
  }
  return temp;
}

export function getCSRFToken(server, auth) {
  return axios({
    method: "get",
    url: (server.includes("http") ? server : "http://" + server) + "/Dashboard",
    headers: {
      "Authorization": "Basic " + auth,
      "Cookie": authCookies[server] ? authCookies[server] : ""
    }
  }).then(response => {
    return extractValue(response.data, "csrf_token=", "'");
  }).catch(e => {
    console.log("Get CSRF Token for server: " + server + " Failed with status code: " + e.statusText);
    callFailed(server);
    console.log(e.message);
  });
}

export function extractReverseValue(data, value, terminator) {
  return extractValue(data.split("").reverse().join(""), value.split("").reverse().join(""), terminator.split("").reverse().join("")).split("").reverse().join("");
}

export function extractValue(data, value, terminator) {
  let start = data.substring(data.toString().indexOf(value) + value.length);
  return start.substring(0, start.indexOf(terminator));
}

export function changeArrayState(action, server, auth, token) {
  return axios({
    method: "POST",
    url: (server.includes("http") ? server : "http://" + server) + "/update.htm",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": authCookies[ip] ? authCookies[ip] : ""
    },
    data: action === "start" ? "startState=STOPPED&file=&csrf_token=" + token + "&cmdStart=Start" : "startState=STARTED&file=&csrf_token=" + token + "&cmdStop=Stop",
    httpAgent: new http.Agent({ keepAlive: true })
  }).then((response) => {
    return response.data;
  }).catch(e => {
    console.log("Change Array State for ip: " + ip + " Failed with status code: " + e.statusText);
    callFailed(ip);
    console.log(e.message);
  });
}

export function changeVMState(id, action, server, auth, token) {
  return axios({
    method: "POST",
    url: (server.includes("http") ? server : "http://" + server) + "/plugins/dynamix.vm.manager/include/VMajax.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": authCookies[server] ? authCookies[server] : ""
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
    console.log("Change VM State for ip: " + server + " Failed with status code: " + e.statusText);
    callFailed(server);
    console.log(e.message);
  });
}

export function changeDockerState(id, action, server, auth, token) {
  return axios({
    method: "POST",
    url: (server.includes("http") ? server : "http://" + server) + "/plugins/dynamix.docker.manager/include/Events.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": authCookies[server] ? authCookies[server] : ""
    },
    data: "container=" + id + "&action=" + action.replace("domain-", "") + "&csrf_token=" + token,
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
    console.log("Change Docker State for ip: " + server + " Failed with status code: " + e.statusText);
    callFailed(server);
    console.log(e.message);
  });
}

export function gatherDetailsFromEditVM(ip, id, vmObject, auth) {
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  if (!vmObject) {
    vmObject = servers[ip].vm.details[id];
  }
  return axios({
    method: "get",
    url: (ip.includes("http") ? ip : "http://" + ip) + "/VMs/UpdateVM?uuid=" + id,
    headers: {
      "Authorization": "Basic " + auth,
      "Cookie": authCookies[ip] ? authCookies[ip] : ""
    }
  }).then(response => {
    return extractVMDetails(vmObject, response, ip);
  }).catch(e => {
    console.log("Get VM Edit details for ip: " + ip + " Failed with status code: " + e.statusText);
    callFailed(ip);
    console.log(e.message);
    vmObject.edit = servers[ip].vm.details[id].edit;
    return vmObject;
  });
}

function getVMStaticData(response) {
  return {
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
}

function extractCPUDetails(response) {
  let cpuDetails = [];
  while (response.data.includes("for='vcpu")) {
    let row = extractValue(response.data, "<label for='vcpu", "</label>");
    if (row.includes("checked")) {
      cpuDetails.push(extractValue(row, "value='", "'"));
    }
    response.data = response.data.replace("for='vcpu", "");
  }
  return cpuDetails;
}

function extractDiskData(response) {
  let disks = [];
  while (response.data.includes("id=\"disk_")) {
    let row = extractValue(response.data, "id=\"disk_", ">");
    let disk = extractValue(row, "", "\"");
    let diskselect = extractReverseValue(extractValue(response.data, "<select name=\"disk[" + disk + "][select]\"", "selected>"), "'", "value='");
    let diskdriver = extractReverseValue(extractValue(response.data, "<select name=\"disk[" + disk + "][driver]\"", "selected>"), "'", "value='");
    let diskbus = extractReverseValue(extractValue(response.data, "<select name=\"disk[" + disk + "][bus]\"", "selected>"), "'", "value='");
    let disksize = extractValue(response.data, "name=\"disk[" + disk + "][size]\" value=\"", "\"");
    let diskpath = extractValue(row, "value=\"", "\"");
    if (diskpath) {
      disks.push({
        select: diskselect,
        image: diskpath,
        driver: diskdriver,
        bus: diskbus,
        size: disksize
      });
    }
    response.data = response.data.replace("id=\"disk_", "");
  }
  return disks;
}

function extractShareData(response) {
  let shares = [];
  response.data.replace("<script type=\"text/html\" id=\"tmplShare\">\n" +
    "                                                                                <table class=\"domain_os other\">\n" +
    "                                                                                    <tr class=\"advanced\">\n" +
    "                                                                                        <td>Unraid Share:</td>", "");

  while (response.data.includes("<td>Unraid Share:</td>")) {
    let sourceRow = extractValue(response.data, "<td>Unraid Share:</td>", "</td>");
    let targetRow = extractValue(response.data, "<td>Unraid Mount tag:</td>", "</td>");
    shares.push({
      source: extractValue(sourceRow, "value=\"", "\""),
      target: extractValue(targetRow, "value=\"", "\"")
    });
    response.data = response.data.replace("<td>Unraid Share:</td>", "");
  }
  return shares;
}

function extractUSBData(response, vmObject, ip) {
  let usbs = [];
  let usbInfo = extractValue(response.data, "<td>USB Devices:</td>", "</td>");
  while (usbInfo.includes("value=\"")) {
    let row = extractValue(usbInfo, "value=\"", " (");
    let usb = {};
    if (row.includes("checked")) {
      usb.checked = true;
    }
    usb.id = row.substring(0, row.indexOf("\""));
    usb.name = row.substring(row.indexOf("/") + 3);
    usb.connected = true;
    usbs.push(usb);

    usbInfo = usbInfo.replace("value=\"", "");
  }
  let rawdata = fs.readFileSync("config/servers.json");
  let servers = JSON.parse(rawdata);
  let oldUsbs = [];
  if (servers[ip].vm && servers[ip].vm.details[vmObject.id] && servers[ip].vm.details[vmObject.id].edit) {
    oldUsbs = servers[ip].vm.details[vmObject.id].edit.usbs;
  }
  if (oldUsbs && oldUsbs.length > usbs.length) {
    oldUsbs.forEach(usb => {
      if (usbs.filter(usbInner => usbInner.id === usb.id).length === 0) {
        usb.connected = false;
        usbs.push(usb);
      }
    });
  }
  return usbs;
}

function extractPCIData(response) {
  let pcis = [];
  while (response.data.includes(" name=\"pci[]\" id")) {
    let row = extractValue(response.data, " name=\"pci[]\" id", "/>");
    let device = {};
    device.name = extractValue(extractValue(response.data, " name=\"pci[]\" id", "/label>"), ">", "<");
    if (row.includes("checked")) {
      device.checked = true;
    }
    device.id = extractValue(row, "value=\"", "\"");
    pcis.push(device);

    response.data = response.data.replace(" name=\"pci[]\" id", "");
  }
  return pcis;
}

function extractIndividualGPU(gpuInfo, gpuNo, vmObject, response) {
  while (gpuInfo.includes("<option value='")) {
    let row = extractValue(gpuInfo, "<option value='", ">");
    let gpu = {};
    gpu.gpu = true;
    gpu.id = row.substring(0, row.indexOf("'"));
    gpu.name = extractValue(extractValue(gpuInfo, "<option value='", "/option>"), ">", "<");
    if (row.includes("selected")) {
      gpu.checked = true;
      gpu.position = gpuNo;
      if (gpuNo > 0 && vmObject.edit.pcis && vmObject.edit.pcis.length > 0) {
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
}

function extractGPUData(response, vmObject) {
  let gpuNo = 0;
  while (response.data.includes("<td>Graphics Card:</td>")) {
    let gpuInfo = extractValue(response.data, "<td>Graphics Card:</td>", "</td>");
    extractIndividualGPU(gpuInfo, gpuNo, vmObject, response);
    gpuNo++;
    response.data = response.data.replace("<td>Graphics Card:</td>", "");
  }
}

function extractSoundData(response, vmObject) {
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
}

function extractNICInformation(response) {
  let nicInfo = extractValue(response.data, "<table data-category=\"Network\" data-multiple=\"true\"", "</table>");
  let nicNo = 0;

  let nics = [];
  while (nicInfo.includes("<td>Network MAC:</td>")) {
    let nic = {};
    nic.mac = extractValue(nicInfo, "name=\"nic[" + nicNo + "][mac]\" class=\"narrow\" value=\"", "\"");
    nic.network = extractReverseValue(extractValue(nicInfo, "name=\"nic[" + nicNo + "][network]\"", "selected>"), "'", "value='");
    nics.push(nic);

    nicInfo = nicInfo.replace("<td>Network MAC:</td>", "");
  }
  return nics;
}

function extractVMDetails(vmObject, response, ip) {
  vmObject.xml = extractValue(response.data, "<textarea id=\"addcode\" name=\"xmldesc\" placeholder=\"Copy &amp; Paste Domain XML Configuration Here.\" autofocus>", "</textarea>").split("&lt;").join("<").split("&gt;").join(">");

  vmObject.edit = getVMStaticData(response);

  vmObject.edit.vcpus = extractCPUDetails(response);

  vmObject.edit.disks = extractDiskData(response);

  vmObject.edit.shares = extractShareData(response);

  vmObject.edit.usbs = extractUSBData(response, vmObject, ip);

  vmObject.edit.pcis = extractPCIData(response);

  extractGPUData(response, vmObject);

  extractSoundData(response, vmObject);

  vmObject.edit.nics = extractNICInformation(response);
  return vmObject;
}

export async function requestChange(ip, id, auth, vmObject, create) {
  return axios({
    method: "POST",
    url: (ip.includes("http") ? ip : "http://" + ip) + "/plugins/dynamix.vm.manager/templates/Custom.form.php",
    headers: {
      "Authorization": "Basic " + auth,
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "Cookie": authCookies[ip] ? authCookies[ip] : ""
    },
    data: await buildForm(ip, auth, id, vmObject, create),
    httpAgent: new http.Agent({ keepAlive: true })
  }).then((response) => {
    return response.data;
  }).catch(e => {
    console.log("Make Edit for ip: " + ip + " Failed with status code: " + e.statusText);
    callFailed(ip);
    console.log(e.message);
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
  if (vmObject.vcpus && vmObject.vcpus.length > 0) {
    vmObject.vcpus.forEach(cpu => {
      form += "&domain%5Bvcpu%5D%5B%5D=" + cpu;
    });
  }
  return form;
}

export function getDiskPart(vmObject, form) {
  if (vmObject.disks && vmObject.disks.length > 0) {
    vmObject.disks.forEach((disk, index) => {
      form += "&disk%5B" + index + "%5D%5Bimage%5D=" + disk.image;
      form += "&disk%5B" + index + "%5D%5Bselect%5D=" + disk.select;
      form += "&disk%5B" + index + "%5D%5Bsize%5D=" + disk.size;
      form += "&disk%5B" + index + "%5D%5Bdriver%5D=" + disk.driver;
      form += "&disk%5B" + index + "%5D%5Bbus%5D=" + disk.bus;
    });
  }
  return form;
}

export function getSharePart(vmObject, form) {
  if (vmObject.shares && vmObject.shares.length > 0) {
    vmObject.shares.forEach((share, index) => {
      form += "&shares%5B" + index + "%5D%5Bsource%5D=" + share.source;
      form += "&shares%5B" + index + "%5D%5Btarget%5D=" + share.target;
    });
  }
  return form;
}

export function getPCIPart(vmObject, form) {
  let audioDevices = 0;
  let gpus = 0;
  if (vmObject.pcis && vmObject.pcis.length > 0) {
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
  }
  return form;
}

export function getUSBPart(vmObject, form) {
  if (vmObject.usbs && vmObject.usbs.length > 0) {
    vmObject.usbs.forEach(usbDevice => {
      form += "&usb%5B%5D=" + encodeURI(usbDevice.id) + (usbDevice.checked ? "" : "%23remove");
    });
  }
  return form;
}

export function getNetworkPart(vmObject, form) {
  if (vmObject.nics && vmObject.nics.length > 0) {
    vmObject.nics.forEach((nicDevice, index) => {
      form += "&nic%5B" + index + "%5D%5Bmac%5D=" + nicDevice.mac;
      form += "&nic%5B" + index + "%5D%5Bnetwork%5D=" + nicDevice.network;
    });
  }
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

let failed = {};

function callFailed(ip) {
  if (!failed[ip]) {
    failed[ip] = 1;
  } else {
    failed[ip]++;
  }
  if (failed[ip] > 2) {
    failed[ip] = 0;
    authCookies[ip] = undefined;
  }
}
