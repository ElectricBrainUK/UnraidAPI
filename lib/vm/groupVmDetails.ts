export function groupVmDetails(response, object) {
  response.forEach((row) => {
    if (row.tags['parent-id']) {
      if (!object[row.tags['parent-id']]) {
        object[row.tags['parent-id']] = {};
      }
      object[row.tags['parent-id']].parent = row;
    } else if (row.tags['child-id']) {
      if (!object[row.tags['child-id']]) {
        object[row.tags['child-id']] = {};
      }
      object[row.tags['child-id']].child = row;
    }
  });
}
