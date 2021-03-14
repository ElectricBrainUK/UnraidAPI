import { extractValue } from './extractValue';

export function extractPCIData(response) {
  let pcis = [];
  while (response.data.includes(' name="pci[]" id')) {
    let row = extractValue(response.data, ' name="pci[]" id', '/>');
    let device = {};
    device.name = extractValue(
      extractValue(response.data, ' name="pci[]" id', '/label>'),
      '>',
      '<',
    );
    if (row.includes('checked')) {
      device.checked = true;
    }
    device.id = extractValue(row, 'value="', '"');
    pcis.push(device);

    response.data = response.data.replace(' name="pci[]" id', '');
  }
  return pcis;
}
