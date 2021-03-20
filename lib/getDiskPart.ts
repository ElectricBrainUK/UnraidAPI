import { VmEditDisk } from 'models/vm';

export function getDiskPart(vmObject: { disks?: VmEditDisk[] }, form: string) {
  if (vmObject?.disks?.length > 0) {
    vmObject.disks.forEach((disk, index) => {
      form += `&disk%5B${index}%5D%5Bimage%5D=${disk.image}`;
      form += `&disk%5B${index}%5D%5Bselect%5D=${disk.select}`;
      form += `&disk%5B${index}%5D%5Bsize%5D=${disk.size}`;
      form += `&disk%5B${index}%5D%5Bdriver%5D=${disk.driver}`;
      form += `&disk%5B${index}%5D%5Bbus%5D=${disk.bus}`;
    });
  }
  return form;
}
