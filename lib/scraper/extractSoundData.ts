import { extractValue } from './extractValue';

export function extractSoundData(response, vmObject) {
  let soundInfo = extractValue(response.data, '<td>Sound Card:</td>', '</td>');
  while (soundInfo.includes("<option value='")) {
    let row = extractValue(soundInfo, "<option value='", '>');
    let soundCard = {};
    soundCard.sound = true;
    soundCard.name = extractValue(
      extractValue(soundInfo, "<option value='", '/option>'),
      '>',
      '<',
    );
    if (row.includes('selected')) {
      soundCard.checked = true;
    }
    soundCard.id = row.substring(0, row.indexOf("'"));
    vmObject.edit.pcis.push(soundCard);

    soundInfo = soundInfo.replace("<option value='", '');
  }
}
