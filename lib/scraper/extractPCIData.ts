import { PciDetail } from 'models/pci';
import { extractValue } from './extractValue';

export function extractPCIData(response: { data: string }) {
  let pcis: PciDetail[] = [];
  while (response.data.includes(' name="pci[]" id')) {
    let row = extractValue(response.data, ' name="pci[]" id', '/>');

    const name = extractValue(
      extractValue(response.data, ' name="pci[]" id', '/label>'),
      '>',
      '<',
    );
    let checked = row.includes('checked');

    const id = extractValue(row, 'value="', '"');
    pcis.push({ id, name, checked });

    response.data = response.data.replace(' name="pci[]" id', '');
  }
  return pcis;
}
