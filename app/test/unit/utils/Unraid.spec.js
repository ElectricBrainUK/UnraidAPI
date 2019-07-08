import { flipPCICheck } from "../../../utils/Unraid";

describe('Unraid API', () => {
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
});
