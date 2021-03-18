import { extractValue } from "./extractValue";
import { extractReverseValue } from "./extractReverseValue";

export function getVMStaticData(response) {
  return {
    template_os: extractValue(response.data, "id=\"template_os\" value=\"", "\""),
    domain_type: extractValue(response.data, "domain[type]\" value=\"", "\""),
    template_name: extractValue(response.data, "template[name]\" value=\"", "\""),
    template_icon: extractValue(response.data, "id=\"template_icon\" value=\"", "\""),
    domain_persistent: extractValue(response.data, "domain[persistent]\" value=\"", "\""),
    domain_clock: extractValue(response.data, "domain[clock]\" id=\"domain_clock\" value=\"", "\""),
    domain_arch: extractValue(response.data, "domain[arch]\" value=\"", "\""),
    domain_oldname: extractValue(response.data, "domain[oldname]\" id=\"domain_oldname\" value=\"", "\""),
    domain_name: extractValue(response.data, "placeholder=\"e.g. My Workstation\" value=\"", "\""),
    domain_desc: extractValue(response.data, "placeholder=\"description of virtual machine (optional)\" value=\"", "\""),
    domain_cpumode: extractValue(extractValue(response.data, "domain[cpumode]\" title=\"", "</td>"), "selected>", "</option>"),
    domain_mem: extractReverseValue(extractValue(response.data, "<select name=\"domain[mem]\"", "selected>"), "'", "value='"),
    domain_maxmem: extractReverseValue(extractValue(response.data, "<select name=\"domain[maxmem]\"", "selected>"), "'", "value='"),
    domain_machine: extractReverseValue(extractValue(response.data, "<select name=\"domain[machine]\"", "selected>"), "'", "value='"),
    domain_hyperv: extractReverseValue(extractValue(response.data, "<select name=\"domain[hyperv]\"", "selected>"), "'", "value='"),
    domain_usbmode: extractReverseValue(extractValue(response.data, "<select name=\"domain[usbmode]\"", "selected>"), "'", "value='"),
    domain_ovmf: extractValue(response.data, "name=\"domain[ovmf]\" value=\"", "\""),
    media_cdrom: extractValue(response.data, "name=\"media[cdrom]\" class=\"cdrom\" value=\"", "\""),
    media_cdrombus: extractReverseValue(extractValue(response.data, "<select name=\"media[cdrombus]\"", "selected>"), "'", "value='"),
    media_drivers: extractValue(response.data, "name=\"media[drivers]\" class=\"cdrom\" value=\"", "\""),
    media_driversbus: extractReverseValue(extractValue(response.data, "<select name=\"media[driversbus]\"", "selected>"), "'", "value='"),
    gpu_bios: extractValue(response.data, "=\"^[^.].*\" data-pickroot=\"/\" value=\"", "\""),//todo deprecate
    nic_0_mac: extractValue(response.data, "name=\"nic[0][mac]\" class=\"narrow\" value=\"", "\"") //todo deprecate
  };
}
