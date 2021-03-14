export type ServerMap = Record<string, UnraidServer>;

export interface UnraidServers {
  servers: ServerMap;
}

export interface UnraidServer {
  docker: Docker;
  serverDetails: ServerDetails;
  vm: Vm;
  status: string;
  pciDetails: any;
  usbDetails: UsbDetail[];
}

export interface UsbDetail {
  id: string;
  name: string;
}

export interface Docker {
  details: DockerDetails;
}

export interface DockerDetails {
  images: Images;
  containers: Containers;
}

export interface Vm {
  details: VmDetails;
}

export interface VmDetails {}

export interface Images {}

export interface Containers {
  imageUrl: string;
  name: string;
  status: string;
  containerId: string;
  tag: string;
  uptoDate: string;
}

export interface ServerDetails {
  arrayStatus: string;
  arrayProtection: string;
  moverRunning: boolean;
  parityCheckRunning: boolean;
  title: string;
  cpu: string;
  memory: string;
  motherboard: string;
  diskSpace: string;
  cacheSpace: string;
  version: string;
  arrayUsedSpace: string;
  arrayTotalSpace: string;
  arrayFreeSpace: string;
  cacheUsedSpace: string;
  cacheTotalSpace: string;
  cacheFreeSpace: string;
  on: boolean;
}
