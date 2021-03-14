import { extractReverseValue } from './extractReverseValue';
import { extractValue } from './extractValue';

export function extractDiskData(response) {
  let disks = [];
  while (response.data.includes('id="disk_')) {
    let row = extractValue(response.data, 'id="disk_', '>');
    let disk = extractValue(row, '', '"');
    let diskselect = extractReverseValue(
      extractValue(
        response.data,
        '<select name="disk[' + disk + '][select]"',
        'selected>',
      ),
      "'",
      "value='",
    );
    let diskdriver = extractReverseValue(
      extractValue(
        response.data,
        '<select name="disk[' + disk + '][driver]"',
        'selected>',
      ),
      "'",
      "value='",
    );
    let diskbus = extractReverseValue(
      extractValue(
        response.data,
        '<select name="disk[' + disk + '][bus]"',
        'selected>',
      ),
      "'",
      "value='",
    );
    let disksize = extractValue(
      response.data,
      'name="disk[' + disk + '][size]" value="',
      '"',
    );
    let diskpath = extractValue(row, 'value="', '"');
    if (diskpath) {
      disks.push({
        select: diskselect,
        image: diskpath,
        driver: diskdriver,
        bus: diskbus,
        size: disksize,
      });
    }
    response.data = response.data.replace('id="disk_', '');
  }
  return disks;
}
