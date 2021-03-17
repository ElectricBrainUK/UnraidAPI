export interface GpuPciDetail {
  id: string;
  gpu?: boolean;
  name: string;
  model?: string;
  keymap?: string;
  bios?: string;
}

export interface SoundPciDetail {
  id: string;
  sound?: boolean;
  name: string;
  checked: boolean;
}

export interface GpuVncDetail extends GpuPciDetail {
  checked: boolean;
  position?: number;
}

export type PciDetail = GpuPciDetail | SoundPciDetail | GpuVncDetail;
