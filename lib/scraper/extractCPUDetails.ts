import { extractValue } from './extractValue';

export function extractCPUDetails(response) {
  let cpuDetails = [];
  while (response.data.includes("for='vcpu")) {
    let row = extractValue(response.data, "<label for='vcpu", '</label>');
    if (row.includes('checked')) {
      cpuDetails.push(extractValue(row, "value='", "'"));
    }
    response.data = response.data.replace("for='vcpu", '');
  }
  return cpuDetails;
}