import { PciDetail } from 'models/pci';

export function flipPCICheck(details: { pcis: PciDetail[] }, id: string) {
  let check: boolean;
  details.pcis
    .filter((pciDevice) => pciDevice.id.split('.')[0] === id.split('.')[0])
    .map((device) => {
      device.checked = check ? check : !device.checked;
      if (!check) {
        check = device.checked;
      }
    });
}
