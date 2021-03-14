export function extractDiskDetails(details, tag, name) {
  if (details[tag].includes(' used of ')) {
    let diskDetails = details[tag].split(' used of ');

    details[name + 'UsedSpace'] = diskDetails[0];
    details[name + 'TotalSpace'] = diskDetails[1].substring(
      0,
      diskDetails[1].indexOf(' ('),
    );

    let totalSizeAndDenomination = details[name + 'TotalSpace'].split(' ');
    let usedSizeAndDenomination = details[name + 'UsedSpace'].split(' ');
    let usedNumber = usedSizeAndDenomination[0];
    let totalNumber = totalSizeAndDenomination[0];

    if (usedSizeAndDenomination[1] !== totalSizeAndDenomination[1]) {
      totalNumber *= 1024;
    }

    let freeNumber = totalNumber - usedNumber;
    details[name + 'FreeSpace'] = freeNumber + ' ' + usedSizeAndDenomination[1];
  } else {
    details[tag] = undefined;
  }
}
