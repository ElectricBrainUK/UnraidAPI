import { extractReverseValue } from './extractReverseValue';
import { extractValue } from './extractValue';

export function extractIndividualGPU(gpuInfo, gpuNo, vmObject, response) {
  while (gpuInfo.includes("<option value='")) {
    let row = extractValue(gpuInfo, "<option value='", '>');
    let gpu: any = {};
    gpu.gpu = true;
    gpu.id = row.substring(0, row.indexOf("'"));
    gpu.name = extractValue(
      extractValue(gpuInfo, "<option value='", '/option>'),
      '>',
      '<',
    );
    if (row.includes('selected')) {
      gpu.checked = true;
      gpu.position = gpuNo;
      if (gpuNo > 0 && vmObject.edit.pcis && vmObject.edit.pcis.length > 0) {
        vmObject.edit.pcis.forEach((device, index) => {
          if (device.id === gpu.id) {
            vmObject.edit.pcis.splice(index, 1);
            vmObject.edit.pcis.push(gpu);
          }
        });
      }
    }

    let gpuModel = extractValue(
      response.data,
      '<td>Graphics Card:</td>',
      '</table>',
    );
    if (gpuModel.includes('<td>VNC Video Driver:</td>')) {
      gpu.model = extractReverseValue(
        extractValue(
          gpuModel,
          '<select name="gpu[' + gpuNo + '][model]"',
          'selected>',
        ),
        "'",
        "value='",
      );
      gpu.keymap = extractReverseValue(
        extractValue(
          gpuModel,
          '<select name="gpu[' + gpuNo + '][keymap]"',
          'selected>',
        ),
        "'",
        "value='",
      );
    }

    gpu.bios = extractReverseValue(
      extractValue(response.data, '<td>Graphics ROM BIOS:</td>', ' name="gpu['),
      '"',
      'value="',
    );

    if (gpuNo === 0) {
      vmObject.edit.pcis.push(gpu);
    }

    gpuInfo = gpuInfo.replace("<option value='", '');
  }
}
