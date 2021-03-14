export function getPCIPart(vmObject, form) {
  let audioDevices = 0;
  let gpus = 0;
  if (vmObject.pcis && vmObject.pcis.length > 0) {
    vmObject.pcis.forEach((pciDevice) => {
      if (pciDevice.id === 'vnc' || !pciDevice.id) {
        return;
      }

      if (pciDevice.gpu && pciDevice.checked) {
        form += '&gpu%5B' + gpus + '%5D%5Bid%5D=' + encodeURI(pciDevice.id);
        form += '&gpu%5B' + gpus + '%5D%5Bmodel%5D=' + encodeURI('qxl');
        form +=
          '&gpu%5B' +
          gpus +
          '%5D%5Bkeymap%5D=' +
          (pciDevice.keymap ? encodeURI(pciDevice.keymap) : '');
        form +=
          '&gpu%5B' +
          gpus +
          '%5D%5Bbios%5D=' +
          (pciDevice.bios ? encodeURI(pciDevice.bios) : '');
        gpus++;
      } else if (pciDevice.audio && pciDevice.checked) {
        form +=
          '&audio%5B' + audioDevices + '%5D%5Bid%5D=' + encodeURI(pciDevice.id);
        audioDevices++;
      } else {
        form +=
          '&pci%5B%5D=' +
          encodeURI(pciDevice.id) +
          (pciDevice.checked ? '' : '%23remove');
      }
    });
  }
  return form;
}
