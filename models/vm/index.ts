import { GpuPciDetail, GpuVncDetail, SoundPciDetail } from 'models/pci';

export interface VmMap {
  [key: string]: Vm;
}

export interface Vm {
  extras: string;
  details: VmDetailsMap;
}

export interface VmDetailsMap {
  [key: string]: VmDetails;
}

export interface VmDetails {
  name?: string;
  id?: string;
  status?: string;
  icon?: string;
  coreCount?: number;
  ramAllocation?: string;
  hddAllocation?: {
    all: VmHddAllocation[];
    total: string;
  };
  primaryGPU?: string;
  xml?: string;
  edit?: VmEdit;
}

export interface VmHddAllocation {
  path: string;
  interface: string;
  used: string;
}

export interface VmEdit {
  description: string;
  template_os: string;
  domain_type: string;
  template_name: string;
  template_icon: string;
  domain_persistent: string;
  domain_clock: string;
  domain_arch: string;
  domain_oldname: string;
  domain_name: string;
  domain_desc: string;
  domain_cpumode: string;
  domain_mem: string;
  domain_maxmem: string;
  domain_machine: string;
  domain_hyperv: string;
  domain_usbmode: string;
  domain_ovmf: string;
  media_cdrom: string;
  media_cdrombus: string;
  media_drivers: string;
  media_driversbus: string;
  gpu_bios: string;
  nic_0_mac: string;
  vcpus: number[];
  disks: VmEditDisk[];
  shares: VmEditShare[];
  pcis: (GpuVncDetail | GpuPciDetail | SoundPciDetail)[];
  nics: VmEditNic[];
  usbs: VmEditUsbs[];
}

export interface VmEditDisk {
  select: string;
  image: string;
  driver: string;
  bus: string;
  size: string;
}

export interface VmEditShare {
  source: string;
  target: string;
}

export interface VmEditUsbs {
  id: string;
  name: string;
  connected: boolean;
}

export interface VmAttachUsbs {
  usbId: string;
  vmId: string;
  vm: VmDetails;
}

export interface VmEditPciVnc {
  gpu: boolean;
  id: string;
  name: string;
  checked: boolean;
  position: 0;
  model: string;
  keymap: string;
  bios: string;
}

export interface VmEditPciGpu {
  gpu: boolean;
  id: string;
  name: string;
  model: string;
  keymap: string;
  bios: string;
}

export interface VmEditSound {
  id: string;
  sound: boolean;
  name: string;
  checked: boolean;
}

export interface VmEditNic {
  mac: string;
  network: string;
}
