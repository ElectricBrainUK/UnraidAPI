export function getStaticPart(vmObject, id, create) {
  return (
    'template%5Bos%5D=' +
    vmObject.template_os +
    'template%5Bname%5D=' +
    vmObject.template_name +
    'template%5Bicon%5D=' +
    vmObject.template_icon +
    '&domain%5Bpersistent%5D=' +
    vmObject.domain_persistent +
    '&domain%5Btype%5D=' +
    vmObject.domain_type +
    '&domain%5Bautostart%5D=' +
    1 +
    '&domain%5Buuid%5D=' +
    id +
    '&domain%5Bclock%5D=' +
    vmObject.domain_clock +
    '&domain%5Boldname%5D=' +
    vmObject.domain_oldname +
    '&domain%5Bname%5D=' +
    vmObject.domain_name +
    '&domain%5Barch%5D=' +
    vmObject.domain_arch +
    '&domain%5Bdesc%5D=' +
    vmObject.domain_desc +
    '&domain%5Bcpumode%5D=' +
    vmObject.domain_cpumode +
    '&domain%5Bovmf%5D=' +
    vmObject.domain_ovmf +
    '&domain%5Bmem%5D=' +
    vmObject.domain_mem +
    '&domain%5Bmaxmem%5D=' +
    vmObject.domain_maxmem +
    '&domain%5Bmachine%5D=' +
    vmObject.domain_machine +
    '&domain%5Bhyperv%5D=' +
    vmObject.domain_hyperv +
    '&domain%5Busbmode%5D=' +
    vmObject.domain_usbmode +
    '&media%5Bcdrom%5D=' +
    vmObject.media_cdrom + //todo is encodeURI needed for these 4?
    '&media%5Bcdrombus%5D=' +
    vmObject.media_cdrombus +
    '&media%5Bdrivers%5D=' +
    vmObject.media_drivers +
    '&media%5Bdriversbus%5D=' +
    vmObject.media_driversbus +
    (create ? '&createvm=' + 1 : '&updatevm=' + 1) +
    '&domain%5Bpassword%5D='
  );
}
