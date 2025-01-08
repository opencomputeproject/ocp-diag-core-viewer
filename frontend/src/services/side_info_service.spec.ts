import { SideInfoEvent, SideInfoService } from './side_info_service';

describe('Side Info Service', () => {
  const testrunService =
    jasmine.createSpyObj('mockResultRecordService', ['get']);
  it('should be created', () => {
    testrunService.get.and.returnValue([{}]);
    const service = new SideInfoService(testrunService);
    expect(service).toBeTruthy();
  });

  it("should identify hardware info version correctly.", () => {
    testrunService.get.and.returnValue([{}]);
    const service = new SideInfoService(testrunService);
    expect(
      service.isV1HardwareInfo({
        arena: "myArena",
        manufacturer: "myManufacturer",
        mfgPartNumber: "myMfgPartNum",
        hardwareInfoId: "",
        name: "",
        partNumber: "",
        partType: "",
        fruLocation: {
          blockpath: "MyFruBlockpath",
          devpath: "MyFruDevpath",
          odataId: "MyFruOdataId",
          serialNumber: "myFruSerial",
        },
        componentLocation: {
          blockpath: "MyBlockpath",
          devpath: "MyDevpath",
          odataId: "MyOdataId",
          serialNumber: "mySerial",
        },
      })
    ).toBe(true);

    expect(
      service.isV1HardwareInfo({
        manufacturer: "myManufacturer",
        hardwareInfoId: "",
        name: "",
        partNumber: "",
        partType: "",
        arena: "",
        location: "",
        computerSystem: "",
        odataId: "",
        serialNumber: "",
        manager: "",
        version: "",
        revision: "",
        manufacturerPartNumber: "",
      })
    ).toBe(false);
  });

  it('should notify show hardware info event.', () => {
    testrunService.get.and.returnValue({
      hardwareInfos: {
        0: {
          hostname: 'myHost',
          arena: 'myArena',
          fruLocation: {
            blockpath: 'MyFruBlockpath',
            devpath: 'MyFruDevpath',
            odataId: 'MyFruOdataId',
            serialNumber: 'myFruSerial'
          },
          hardwareInfoId: '0',
          manufacturer: 'myManufacturer',
          mfgPartNumber: 'myMfgPartNum',
          name: 'myName',
          partNumber: '',
          partType: 'myPartType'
        },
      },
    });
    const service = new SideInfoService(testrunService);
    spyOn(service.newSideInfoEvent, 'emit');

    const expectedEvent: SideInfoEvent = {
      title: 'myName',
      subtitle: 'HardwareInfo',
      info: [
        ['Name', 'myName'],
        ['Id', '0'],
        ['Hostname', 'myHost'],
        ['Arena', 'myArena'],
        [
          'Fru Location', {
            blockpath: 'MyFruBlockpath',
            devpath: 'MyFruDevpath',
            odataId: 'MyFruOdataId',
            serialNumber: 'myFruSerial'
          }
        ],
        ['Manufacturer', 'myManufacturer'],
        ['Mfg Part Number', 'myMfgPartNum'],
        ['Part Number', ''],
        ['Part Type', 'myPartType'],
        ['Component Location', undefined],
      ],
    };
    service.newSideInfoEvent.subscribe((event: SideInfoEvent) => {
      expect(event).toEqual(expectedEvent);
    });
    service.showHardwareInfo('0');
    expect(service.newSideInfoEvent.emit).toHaveBeenCalled();
  });

  it('should notify show software info event.', () => {
    testrunService.get.and.returnValue({
      softwareInfos: {
        '0': {
          hostname: 'host',
          softwareInfoId: '0',
          arena: '',
          name: 'sw0',
          version: '',
        },
      }
    });
    const service = new SideInfoService(testrunService);
    spyOn(service.newSideInfoEvent, 'emit');

    const expectedEvent: SideInfoEvent = {
      title: 'sw0',
      subtitle: 'SoftwareInfo',
      info: [
        ['Name', 'sw0'],
        ['Id', '0'],
        ['Hostname', 'host'],
        ['Arena', ''],
        ['Version', ''],
      ],
    };

    service.newSideInfoEvent.subscribe((event: SideInfoEvent) => {
      expect(event).toEqual(expectedEvent);
    });

    service.showSoftwareInfo('0');
    expect(service.newSideInfoEvent.emit).toHaveBeenCalled();
  });

  it("should identify software info version correctly.", () => {
    testrunService.get.and.returnValue([{}]);
    const service = new SideInfoService(testrunService);
    expect(
      service.isV2SoftwareInfo({
        softwareInfoId: "0",
        arena: "",
        name: "sw0",
        version: "",
      })
    ).toBe(false);
    expect(
      service.isV2SoftwareInfo({
        softwareInfoId: "0",
        arena: "",
        name: "sw0",
        version: "",
        computerSystem: ""
      })
    ).toBe(true);
  });
});
