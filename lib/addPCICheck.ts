export function addPCICheck(details, id) {
  details.pcis
    .filter((pciDevice) => pciDevice.id.split('.')[0] === id.split('.')[0])
    .map((device) => (device.checked = true));
}
