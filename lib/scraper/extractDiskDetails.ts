export function extractDiskDetails(details, tag: string, name: string) {
  if (details[tag].includes(' used of ')) {
    const diskDetails = details[tag].split(' used of ');

    details[`${name}UsedSpace`] = diskDetails[0];
    details[`${name}TotalSpace`] = diskDetails[1].substring(
      0,
      diskDetails[1].indexOf(' ('),
    );

    const totalSizeAndDenomination = details[`${name}TotalSpace`].split(' ');
    const usedSizeAndDenomination = details[`${name}UsedSpace`].split(' ');
    const usedNumber = usedSizeAndDenomination[0];
    let totalNumber = totalSizeAndDenomination[0];

    if (usedSizeAndDenomination[1] !== totalSizeAndDenomination[1]) {
      totalNumber *= 1024;
    }

    const freeNumber = totalNumber - usedNumber;
    details[`${name}FreeSpace`] = `${freeNumber} ${usedSizeAndDenomination[1]}`;
  } else {
    details[tag] = undefined;
  }
}
