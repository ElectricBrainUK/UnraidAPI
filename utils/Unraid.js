import axios from "axios";
import fs from "fs";
import http from "http";

function getUnraidDetails(servers) {
  getServerDetails(servers);
  getVMs(servers);

}

function getServerDetails(servers) {
  Object.keys(servers).forEach(async ip => {
    servers[ip].serverDetails = await scrapeHTML(ip, servers);

    updateFile(servers, ip, "serverDetails");
  });
}

function scrapeHTML(ip, servers) {
  return axios({
    method: "get",
    url: "http://" + ip + "/Dashboard",
    headers: {
      "Authorization": "Basic " + servers[ip].authToken
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
    console.log(e);
  });
}

function getVMs(servers) {
  Object.keys(servers).forEach(ip => {
    axios({
      method: "get",
      url: "http://" + ip + "/plugins/dynamix.vm.manager/include/VMMachines.php",
      headers: {
        "Authorization": "Basic " + servers[ip].authToken
      }
    }).then((response) => {
      let parts = response.data.toString().split("\u0000");
      let htmlDetails = JSON.stringify(parts[0]);
      let details = parseHTML(htmlDetails);
      let extras = parts[1];
      servers[ip].vm = {};
      servers[ip].vm.details = processVMResponse(details);
      servers[ip].vm.extras = extras;
      updateFile(servers, ip, "vm");
    }).catch(e => {
      console.log(e);
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
    oldServers[ip][tag] = servers[ip][tag];
    fs.writeFileSync("config/servers.json", JSON.stringify(oldServers));
  }

  fs.writeFileSync("config/servers.json", JSON.stringify(servers));
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

function processVMResponse(response) {
  let object = [];
  groupVmDetails(response, object);
  return simplifyResponse(object);
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

function simplifyResponse(object) {
  let temp = {};
  object.forEach((vm, index) => {
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
    temp[newVMObject.id] = newVMObject;
  });
  return temp;
}

export {
  getUnraidDetails
};

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
    console.log(e);
  });
}

function extractValue(data, value, terminator) {
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
    console.log(e);
  });
}