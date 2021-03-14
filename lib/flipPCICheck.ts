export function flipPCICheck(details, id) {
  let check;
  details.pcis
    .filter((pciDevice) => pciDevice.id.split('.')[0] === id.split('.')[0])
    .map((device) => {
      device.checked = check ? check : !device.checked;
      if (!check) {
        check = device.checked;
      }
    });
}
