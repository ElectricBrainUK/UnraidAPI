export function getSharePart(vmObject, form) {
  if (vmObject.shares && vmObject.shares.length > 0) {
    vmObject.shares.forEach((share, index) => {
      form += '&shares%5B' + index + '%5D%5Bsource%5D=' + share.source;
      form += '&shares%5B' + index + '%5D%5Btarget%5D=' + share.target;
    });
  }
  return form;
}
