export function getCPUPart(vmObject: { vcpus?: number[] }, form: string) {
  if (vmObject.vcpus?.length > 0) {
    vmObject.vcpus.forEach((cpu) => {
      form += '&domain%5Bvcpu%5D%5B%5D=' + cpu;
    });
  }
  return form;
}
