import {
  addPCICheck, extractReverseValue, extractValue,
  flipPCICheck,
  getCPUPart,
  getDiskPart, getNetworkPart, getPCIDetails, getPCIPart, getSharePart,
  getStaticPart, getUnraidDetails, getUSBPart,
  removePCICheck
} from "../../../utils/Unraid";

describe('PCI Check Changes', () => {
  let examplePCIInput = {
    pcis: [
      {
        id: '00:00.1',
        checked: false
      },{
        id: '00:00.2',
      },{
        id: '00:01.1',
        checked: false
      },{
        id: '00:02.1',
        checked: false
      }, {
        id: "01:00.1",
        checked: false
      }
    ]
  };

  let expectedPCIFlipOutput = {
    pcis: [
      {
        id: '00:00.1',
        checked: true
      },{
        id: '00:00.2',
        checked: true
      },{
        id: '00:01.1',
        checked: false
      },{
        id: '00:02.1',
        checked: false
      }, {
        id: "01:00.1",
        checked: false
      }
    ]
  };

  let expectedPCIAddOutput = {
    pcis: [
      {
        id: '00:00.1',
        checked: true
      },{
        id: '00:00.2',
        checked: true
      },{
        id: '00:01.1',
        checked: false
      },{
        id: '00:02.1',
        checked: false
      }, {
        id: "01:00.1",
        checked: false
      }
    ]
  };

  let expectedPCIRemoveOutput = {
    pcis: [
      {
        id: '00:00.1',
        checked: false
      },{
        id: '00:00.2',
        checked: false
      },{
        id: '00:01.1',
        checked: false
      },{
        id: '00:02.1',
        checked: false
      }, {
        id: "01:00.1",
        checked: false
      }
    ]
  };

  let examplePCIInputOddState = {
    pcis: [
      {
        id: '00:00.1',
        checked: false
      },{
        id: '00:00.2',
        checked: true
      },{
        id: '00:01.1',
        checked: false
      },{
        id: '00:02.1',
        checked: false
      }, {
        id: "01:00.1",
        checked: false
      }
    ]
  };

  let expectedPCIFlipOutputOddState = {
    pcis: [
      {
        id: '00:00.1',
        checked: true
      },{
        id: '00:00.2',
        checked: true
      },{
        id: '00:01.1',
        checked: false
      },{
        id: '00:02.1',
        checked: false
      }, {
        id: "01:00.1",
        checked: false
      }
    ]
  };

  test('flips PCI check of all related devices', () => {
    flipPCICheck(examplePCIInput, '00:00.1');
    expect(examplePCIInput).toEqual(expectedPCIFlipOutput);
  });

  test('flips PCI check of all related devices, handle odd state', () => {
    flipPCICheck(examplePCIInputOddState, '00:00.1');
    expect(examplePCIInputOddState).toEqual(expectedPCIFlipOutputOddState);
  });

  test('adds PCI check of all related devices', () => {
    addPCICheck(examplePCIInput, '00:00.1');
    expect(examplePCIInput).toEqual(expectedPCIAddOutput);
  });

  test('removes PCI check of all related devices', () => {
    removePCICheck(examplePCIInput, '00:00.1');
    expect(examplePCIInput).toEqual(expectedPCIRemoveOutput);
  });
});

describe('VM Change Form', () => {
  const staticInput = {
    template_os: 'testValue',
    template_name: 'testValue',
    template_icon: 'testValue',
    domain_persistent: 'testValue',
    domain_type: 'testValue',
    domain_clock: 'testValue',
    domain_oldname: 'testValue',
    domain_name: 'testValue',
    domain_arch: 'testValue',
    domain_desc: 'testValue',
    domain_cpumode: 'testValue',
    domain_ovmf: 'testValue',
    domain_mem: 'testValue',
    domain_maxmem: 'testValue',
    domain_machine: 'testValue',
    domain_hyperv: 'testValue',
    domain_usbmode: 'testValue',
    media_cdrom: 'testValue',
    media_cdrombus: 'testValue',
    media_drivers: 'testValue',
    media_driversbus: 'testValue',
  };

  const cpuInput = {
    vcpus: [
      0,
      2,
      4
    ]
  };

  const diskInput = {
    disks: [
      {
        image: 'testImage',
        select: 'testSelect',
        size: 'testSize',
        driver: 'testDriver',
        bus: 'testBus',
      }
    ]
  };

  const shareInput = {
    shares: [
      {
        source: 'testSource',
        target: 'testTarget',
      }
    ]
  };

  const pciInput = {
    pcis: [
      {
        id: 'testID',
        checked: true,
      },
      {
        id: 'testID2',
        checked: true,
        gpu: true,
      },
      {
        id: 'testID3',
        checked: true,
        audio: true,
      },
      {
        id: 'testID4',
      },
      {
        id: 'testID5',
        checked: false,
        gpu: true,
      },
      {
        id: 'testID6',
        audio: true,
      },
      {
        id: 'vnc',
        checked: true,
        gpu: true,
      },
    ]
  };

  const usbInput = {
    usbs: [
      {
        id: 'testID',
        checked: true,
      },
      {
        id: 'testID2'
      }
    ]
  };

  const networkInput = {
    nics: [
      {
        mac: 'testMac',
        network: 'testNetwork',
      },
      {
        mac: 'testMac2',
        network: 'testNetwork2',
      },
    ]
  };

  const expectedStaticPart = 'template%5Bos%5D=testValuetemplate%5Bname%5D=testValuetemplate%5Bicon%5D=testValue&domain%5Bpersistent%5D=testValue&domain%5Btype%5D=testValue&domain%5Bautostart%5D=1&domain%5Buuid%5D=testID&domain%5Bclock%5D=testValue&domain%5Boldname%5D=testValue&domain%5Bname%5D=testValue&domain%5Barch%5D=testValue&domain%5Bdesc%5D=testValue&domain%5Bcpumode%5D=testValue&domain%5Bovmf%5D=testValue&domain%5Bmem%5D=testValue&domain%5Bmaxmem%5D=testValue&domain%5Bmachine%5D=testValue&domain%5Bhyperv%5D=testValue&domain%5Busbmode%5D=testValue&media%5Bcdrom%5D=testValue&media%5Bcdrombus%5D=testValue&media%5Bdrivers%5D=testValue&media%5Bdriversbus%5D=testValue&updatevm=1&domain%5Bpassword%5D=';
  const expectedStaticPartCreate = 'template%5Bos%5D=testValuetemplate%5Bname%5D=testValuetemplate%5Bicon%5D=testValue&domain%5Bpersistent%5D=testValue&domain%5Btype%5D=testValue&domain%5Bautostart%5D=1&domain%5Buuid%5D=testID&domain%5Bclock%5D=testValue&domain%5Boldname%5D=testValue&domain%5Bname%5D=testValue&domain%5Barch%5D=testValue&domain%5Bdesc%5D=testValue&domain%5Bcpumode%5D=testValue&domain%5Bovmf%5D=testValue&domain%5Bmem%5D=testValue&domain%5Bmaxmem%5D=testValue&domain%5Bmachine%5D=testValue&domain%5Bhyperv%5D=testValue&domain%5Busbmode%5D=testValue&media%5Bcdrom%5D=testValue&media%5Bcdrombus%5D=testValue&media%5Bdrivers%5D=testValue&media%5Bdriversbus%5D=testValue&createvm=1&domain%5Bpassword%5D=';
  const expectedCPUPart = '&domain%5Bvcpu%5D%5B%5D=0&domain%5Bvcpu%5D%5B%5D=2&domain%5Bvcpu%5D%5B%5D=4';
  const expectedDiskPart = '&disk%5B0%5D%5Bimage%5D=testImage&disk%5B0%5D%5Bselect%5D=testSelect&disk%5B0%5D%5Bsize%5D=testSize&disk%5B0%5D%5Bdriver%5D=testDriver&disk%5B0%5D%5Bbus%5D=testBus';
  const expectedSharePart = '&shares%5B0%5D%5Bsource%5D=testSource&shares%5B0%5D%5Btarget%5D=testTarget';
  const expectedPCIPart = '&pci%5B%5D=testID&gpu%5B0%5D%5Bid%5D=testID2&gpu%5B0%5D%5Bmodel%5D=qxl&gpu%5B0%5D%5Bkeymap%5D=&gpu%5B0%5D%5Bbios%5D=&audio%5B0%5D%5Bid%5D=testID3&pci%5B%5D=testID4%23remove&pci%5B%5D=testID5%23remove&pci%5B%5D=testID6%23remove';
  const expectedUSBPart = '&usb%5B%5D=testID&usb%5B%5D=testID2%23remove';
  const expectedNetworkPart = '&nic%5B0%5D%5Bmac%5D=testMac&nic%5B0%5D%5Bnetwork%5D=testNetwork&nic%5B1%5D%5Bmac%5D=testMac2&nic%5B1%5D%5Bnetwork%5D=testNetwork2';

  test('Get Static Part (Edit)', () => {
    expect(getStaticPart(staticInput, 'testID', false)).toEqual(expectedStaticPart);
  });

  test('Get Static Part (Create)', () => {
    expect(getStaticPart(staticInput, 'testID', true)).toEqual(expectedStaticPartCreate);
  });

  test('Get CPU Part', () => {
    expect(getCPUPart(cpuInput, '')).toEqual(expectedCPUPart);
  });

  test('Get Disk Part', () => {
    expect(getDiskPart(diskInput, '')).toEqual(expectedDiskPart);
  });

  test('Get Share Part', () => {
    expect(getSharePart(shareInput, '')).toEqual(expectedSharePart);
  });

  test('Get PCI Part', () => {
    expect(getPCIPart(pciInput, '')).toEqual(expectedPCIPart);
  });

  test('Get USB Part', () => {
    expect(getUSBPart(usbInput, '')).toEqual(expectedUSBPart);
  });

  test('Get Network Part', () => {
    expect(getNetworkPart(networkInput, '')).toEqual(expectedNetworkPart);
  });
});

describe('Detail Extraction', () => {

  const expectedUnraidDetails = {"1": {"pciDetails": [{"id": "1", "name": "test"}, {"id": "21", "name": "test2"}], "vm": {"details": {"testVM": {"edit": {"pcis": [{"id": "1", "name": "test"}, {"id": "21", "name": "test2"}]}}}}}};

  test('Extract Value from HTML', () => {
    const inputToExtractFrom = 'aloadOfDataWithRandom<HTML><tags with="attributes" and="ids">test</tags></HTML>';
    expect(extractValue(inputToExtractFrom, 'with="', '"')).toEqual('attributes');
    expect(extractValue(inputToExtractFrom, '">', '<')).toEqual('test');
  });

  test('Extract Value from HTML by reversing the string', () => {
    const inputToExtractFrom = 'aloadOfDataWithRandom<HTML><tags with="attributes">test</tags><tags with="values" selected>test</tags></HTML>';
    expect(extractReverseValue(extractValue(inputToExtractFrom, '<tags', 'selected>'), '"', 'with="')).toEqual('values');
  });

  test('Get PCI Details', () => {
    let inputDetails = {"1":{vm: {details: {testVM: {edit:{pcis:[{name: 'test', id: '1'}, {name: 'test2', id: '21'}]}}}}}};
    getPCIDetails(inputDetails, true);
    expect(inputDetails).toEqual(expectedUnraidDetails);
  });
  
});
