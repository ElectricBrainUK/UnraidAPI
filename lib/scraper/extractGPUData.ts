import { extractValue } from './extractValue';
import { extractIndividualGPU } from './extractIndividualGPU';

export function extractGPUData(response, vmObject) {
  let gpuNo = 0;
  while (response.data.includes('<td>Graphics Card:</td>')) {
    let gpuInfo = extractValue(
      response.data,
      '<td>Graphics Card:</td>',
      '</td>',
    );
    extractIndividualGPU(gpuInfo, gpuNo, vmObject, response);
    gpuNo++;
    response.data = response.data.replace('<td>Graphics Card:</td>', '');
  }
}
