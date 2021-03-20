export function getUSBPart(vmObject, form: string) {
  if (vmObject.usbs && vmObject.usbs.length > 0) {
    vmObject.usbs.forEach((usbDevice) => {
      form +=
        '&usb%5B%5D=' +
        encodeURI(usbDevice.id) +
        (usbDevice.checked ? '' : '%23remove');
    });
  }
  return form;
}
