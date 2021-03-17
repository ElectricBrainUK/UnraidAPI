import { Docker } from 'lib/unraid/types';
import { PciDetail } from 'models/pci';
import { UsbDetail } from 'models/usb';
import { Vm } from 'models/vm';

export interface ServerDetails {
  arrayStatus?: string;
  arrayProtection?: string;
  moverRunning?: boolean;
  parityCheckRunning?: boolean;
  title?: string;
  cpu?: string;
  memory?: string;
  motherboard?: string;
  diskSpace?: string;
  version?: string;
  arrayUsedSpace?: string;
  arrayTotalSpace?: string;
  arrayFreeSpace?: string;
  on: boolean;
}

export interface Server {
  vm?: Vm;
  docker?: Docker;
  serverDetails?: ServerDetails;
  pciDetails?: PciDetail[];
  status?: string;
  usbDetails?: UsbDetail[];
}

export interface ServerMap {
  [key: string]: Server;
}
