import { SoundPciDetail } from 'models/pci';
import { extractValue } from './extractValue';

export function extractSoundData(response, vmObject) {
  let soundInfo = extractValue(response.data, '<td>Sound Card:</td>', '</td>');
  while (soundInfo.includes("<option value='")) {
    let row = extractValue(soundInfo, "<option value='", '>');
    let soundCard: SoundPciDetail = {
      id: row.substring(0, row.indexOf("'")),
      sound: true,
      name: extractValue(
        extractValue(soundInfo, "<option value='", '/option>'),
        '>',
        '<',
      ),
      checked: row.includes('selected'),
    };

    vmObject.edit.pcis.push(soundCard);

    soundInfo = soundInfo.replace("<option value='", '');
  }
}
