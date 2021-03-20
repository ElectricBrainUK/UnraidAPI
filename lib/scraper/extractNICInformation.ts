import { VmEditNic } from 'models/vm';
import { extractReverseValue } from './extractReverseValue';
import { extractValue } from './extractValue';

export function extractNICInformation(response: { data: string }) {
  let nicInfo = extractValue(
    response.data,
    '<table data-category="Network" data-multiple="true"',
    '</table>',
  );
  let nicNo = 0;

  let nics: VmEditNic[] = [];
  while (nicInfo.includes('<td>Network MAC:</td>')) {
    let nic = {
      mac: '',
      network: '',
    };
    nic.mac = extractValue(
      nicInfo,
      'name="nic[' + nicNo + '][mac]" class="narrow" value="',
      '"',
    );
    nic.network = extractReverseValue(
      extractValue(nicInfo, 'name="nic[' + nicNo + '][network]"', 'selected>'),
      "'",
      "value='",
    );
    nics.push(nic);

    nicInfo = nicInfo.replace('<td>Network MAC:</td>', '');
  }
  return nics;
}
