import { BehaviorSubject, Observable } from 'rxjs';
import { ResultRecordService } from './result_record_service';
import * as results from './results_type';
import { TestRunService } from './testrun_service';

const dataReadySubject = new BehaviorSubject<boolean>(false);
const dataReady$ = dataReadySubject.asObservable();
describe('TestRun Service', () => {
  it('should be created', () => {
    const service = new TestRunService(new ResultRecordService());
    expect(service).toBeDefined();
  });
});

const startRunRecord = {
  'category': 'Start',
  'message': 'myTest v399701328',
  'raw': {
    'sequenceNumber': 6,
    'testRunArtifact': {
      'testRunStart': {
        'dutInfo': [{
          'hardwareInfos': [
            {
              'arena': 'myArena',
              'fruLocation': {
                'blockpath': 'MyFruBlockpath',
                'devpath': 'MyFruDevpath',
                'odataId': 'MyFruOdataId',
                'serialNumber': 'myFruSerial'
              },
              'hardwareInfoId': '0',
              'manufacturer': 'myManufacturer',
              'mfgPartNumber': 'myMfgPartNum',
              'name': 'myName',
              'partNumber': '',
              'partType': 'myPartType'
            },
          ],
          'hostname': 'TestHost',
          'softwareInfos': [{
            'arena': 'myArena',
            'name': 'my_test',
            'softwareInfoId': '0',
            'version': 'myVersion'
          }]
        }],
        'name': 'myTest',
        'parameters': {
          'key': 'value',
        },
        'version': '399701328'
      }
    },
    'timestamp': '2021-10-12T14:09:43.549303038Z'
  },
  'sequenceNumber': 6,
  'severity': 'INFO',
  'stage': 'Run',
  'timestamp': '2021-10-12T14:09:43.549303038Z'
};


describe('TestRun Service: testRunArtifact', () => {
  const recordService =
    jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });
  it('should support testRunStart', () => {
    recordService.get.and.returnValue([startRunRecord]);

    const service = new TestRunService(recordService);
    const testrun = service.get();

    expect(testrun.name).toEqual('myTest');
    expect(testrun.version).toEqual('399701328');
    expect(testrun.startTime).toEqual('2021-10-12T14:09:43.549303038Z');
    expect(testrun.parameters).toEqual({ 'key': 'value' });
    expect(Object.keys(testrun.hardwareInfos)).toEqual(['0']);
    expect(testrun.hardwareInfos['0'].hostname).toEqual('TestHost');
    expect(testrun.hardwareInfos['0'].name).toEqual('myName');
    expect(Object.keys(testrun.softwareInfos)).toEqual(['0']);
    expect(testrun.softwareInfos['0'].hostname).toEqual('TestHost');
    expect(testrun.softwareInfos['0'].name).toEqual('my_test');
  });

  it('should support testRunEnd', () => {
    recordService.get.and.returnValue([{
      'category': 'End',
      'message': '[ERROR / FAIL] myTest',
      'raw': {
        'sequenceNumber': 33,
        'testRunArtifact': {
          'testRunEnd': { 'name': 'myTest', 'result': 'FAIL', 'status': 'ERROR' }
        },
        'timestamp': '2021-10-12T14:09:43.563567905Z'
      },
      'sequenceNumber': 33,
      'severity': 'ERROR',
      'stage': 'Run',
      'timestamp': '2021-10-12T14:09:43.563567905Z'
    }]);

    const service = new TestRunService(recordService);
    const testrun = service.get();

    expect(testrun.endTime).toEqual('2021-10-12T14:09:43.563567905Z');
    expect(testrun.result).toEqual('FAIL');
    expect(testrun.status).toEqual('ERROR');
  });

  it('should support error', () => {
    recordService.get.and.returnValue([
      {
        category: "Error",
        message: "demo-testrun-error-symptom: demo error message.",
        raw: {
          sequenceNumber: 4,
          testRunArtifact: {
            error: {
              message: "demo error message.",
              softwareInfoIds: ["0"],
              symptom: "demo-testrun-error-symptom",
            },
          },
          timestamp: "2021-10-12T14:09:43.548601100Z",
        },
        sequenceNumber: 4,
        severity: "ERROR",
        stage: "Run",
        timestamp: "2021-10-12T14:09:43.548601100Z",
      },
    ]);

    const service = new TestRunService(recordService);
    const testrun = service.get();

    expect(testrun.errors.length).toEqual(1);
    expect(testrun.errors[0].message).toEqual("demo error message.");
    expect(testrun.errors[0].softwareInfoIds).toEqual(["0"]);
    expect(testrun.errors[0].symptom).toEqual('demo-testrun-error-symptom');
  });

  it('should support tag', () => {
    recordService.get.and.returnValue([{
      'category': 'Tag',
      'message': 'tag message',
      'raw': {
        'sequenceNumber': 5,
        'testRunArtifact': { 'tag': { 'tag': 'tag message' } },
        'timestamp': '2021-10-12T14:09:43.548764032Z'
      },
      'sequenceNumber': 5,
      'severity': 'INFO',
      'stage': 'Run',
      'timestamp': '2021-10-12T14:09:43.548764032Z'
    }]);

    const service = new TestRunService(recordService);
    const testrun = service.get();

    expect(testrun.tags.length).toEqual(1);
    expect(testrun.tags[0]).toEqual('tag message');
  });
});

const startStepRecord = {
  'category': 'Start',
  'message': 'my_first_step',
  'raw': {
    'sequenceNumber': 7,
    'testStepArtifact':
      { 'testStepId': '0', 'testStepStart': { 'name': 'my_first_step' } },
    'timestamp': '2021-10-12T14:09:43.550786077Z'
  },
  'sequenceNumber': 7,
  'severity': 'INFO',
  'stage': 'Step 0',
  'timestamp': '2021-10-12T14:09:43.550786077Z'
};


describe('TestRun Service: testStepArtifact', () => {
  const recordService =
    jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });

  it('should support testStepStart', () => {
    recordService.get.and.returnValue([startStepRecord]);

    const service = new TestRunService(recordService);
    const testrun = service.get();

    expect(Object.keys(testrun.steps)).toEqual(['0']);
    expect(testrun.steps['0'].name).toEqual('my_first_step');
    expect(testrun.steps['0'].startTime)
      .toEqual('2021-10-12T14:09:43.550786077Z');
  });

  it('should support testStepEnd', () => {
    recordService.get.and.returnValue([
      startStepRecord,
      {
        'category': 'End',
        'message': '[COMPLETE] my_first_step',
        'raw': {
          'sequenceNumber': 32,
          'testStepArtifact': {
            'testStepEnd': { 'name': 'my_first_step', 'status': 'COMPLETE' },
            'testStepId': '0'
          },
          'timestamp': '2021-10-12T14:09:43.563272217Z'
        },
        'sequenceNumber': 32,
        'severity': 'INFO',
        'stage': 'Step 0',
        'timestamp': '2021-10-12T14:09:43.563272217Z'
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps['0'];

    expect(teststep.status).toEqual('COMPLETE');
    expect(teststep.endTime).toEqual('2021-10-12T14:09:43.563272217Z');
  });

  it('should support testStepEnd', () => {
    recordService.get.and.returnValue([
      startStepRecord,
      {
        'category': 'End',
        'message': '[COMPLETE] my_first_step',
        'raw': {
          'sequenceNumber': 32,
          'testStepArtifact': {
            'testStepEnd': { 'name': 'my_first_step', 'status': 'COMPLETE' },
            'testStepId': '0'
          },
          'timestamp': '2021-10-12T14:09:43.563272217Z'
        },
        'sequenceNumber': 32,
        'severity': 'INFO',
        'stage': 'Step 0',
        'timestamp': '2021-10-12T14:09:43.563272217Z'
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps['0'];

    expect(teststep.status).toEqual('COMPLETE');
    expect(teststep.endTime).toEqual('2021-10-12T14:09:43.563272217Z');
  });

  it('should support diagnosis', () => {
    recordService.get.and.returnValue([
      startStepRecord,
      {
        'category': 'Diagnosis',
        'message': '[PASS] my_test-good: my hardware is good!',
        'raw': {
          'sequenceNumber': 23,
          'testStepArtifact': {
            'diagnosis': {
              'hardwareInfoId': ['0'],
              'message': 'my hardware is good!',
              'verdict': 'my_test-good',
              'type': 'PASS'
            },
            'testStepId': '0'
          },
          'timestamp': '2021-10-12T14:09:43.560580951Z'
        },
        'sequenceNumber': 23,
        'severity': 'INFO',
        'stage': 'Step 0',
        'timestamp': '2021-10-12T14:09:43.560580951Z'
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps['0'];

    expect(teststep.diagnoses.length).toEqual(1);
    expect(teststep.diagnoses[0]).toEqual({
      'hardwareInfoId': ['0'],
      'message': 'my hardware is good!',
      'verdict': 'my_test-good',
      'type': 'PASS'
    });
  });

  function buildMeasurement(element: results.MeasurementElement) {
    return {
      category: "Measurement",
      message: "number-measurement[0] = 1.23",
      raw: {
        sequenceNumber: 13,
        testStepArtifact: {
          measurement: {
            ...element,
            hardwareInfoId: "1",
            name: "number-measurement",
            unit: "number-measurement-unit",
          },
          testStepId: "0",
        },
        timestamp: "2021-10-12T14:09:43.553624128Z",
      },
      sequenceNumber: 13,
      severity: "INFO",
      stage: "Step 0",
      timestamp: "2021-10-12T14:09:43.553624128Z",
    };
  }

  function buildMeasurementWithRange(
    value: unknown,
    range: results.MeasurementElementRange
  ) {
    return buildMeasurement({
      index: 0,
      measurementSeriesId: "NOT_APPLICABLE",
      range: range,
      value: value,
    });
  }

  function buildMeasurementWithValidValues(
    value: unknown,
    validValues: results.MeasurementElementValidValues
  ) {
    return buildMeasurement({
      index: 0,
      measurementSeriesId: "NOT_APPLICABLE",
      validValues: validValues,
      value: value,
    });
  }

  function buildMeasurementWithValidators(
    validators: results.Validator[],
    value: any
  ) {
    return {
      category: "Measurement",
      message: "number-measurement[0] = 1.23",
      raw: {
        sequenceNumber: 13,
        testStepArtifact: {
          measurement: {
            index: 0,
            measurementSeriesId: "",
            hardwareInfoId: "1",
            name: "number-measurement",
            unit: "number-measurement-unit",
            validators,
            value,
          },
          testStepId: "0",
        },
        timestamp: "2021-10-12T14:09:43.553624128Z",
      },
      sequenceNumber: 1,
      severity: "INFO",
      stage: "Step 0",
      timestamp: "2021-10-12T14:09:43.553624128Z",
    };
  }

  it("should support measurement", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithRange(1.23, { maximum: 2.34, minimum: 0.12 }),
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0]).toEqual({
      valid: true,
      index: 0,
      measurementSeriesId: "NOT_APPLICABLE",
      range: { maximum: 2.34, minimum: 0.12 },
      value: 1.23,
      hardwareInfoId: "1",
      name: "number-measurement",
      unit: "number-measurement-unit",
    });
  });

  it("measurement number value not in range should be invalid ", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithRange(1.23, { maximum: 4, minimum: 2 }),
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeFalse();
    expect(teststep.failure).toBeTrue();
  });

  it("measurement string value not in range should be valid ", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithRange("version-1.23", {
        maximum: "version-4.0",
        minimum: "version-0.1",
      }),
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeTrue();
  });

  it("measurement number value not in valid values should be invalid ", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidValues(1.23, { values: [1.24, 2.33] }),
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeFalse();
    expect(teststep.failure).toBeTrue();
  });

  it("measurement string value in valid values should be valid ", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidValues("version-1.23", {
        values: ["version-1.22", "version-1.23", "version-1.24"],
      }),
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeTrue();
  });

  it("measurement with validator type equal should be correct", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "equalValidator",
            type: results.ValidatorType.EQUAL,
            value: 100,
            metadata: {},
          },
        ],
        100
      ),
      buildMeasurementWithValidators(
        [
          {
            name: "equalValidator",
            type: results.ValidatorType.EQUAL,
            value: 100,
            metadata: {},
          },
        ],
        200
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(2);
    expect(teststep.measurements[0].valid).toBeTrue();
    expect(teststep.measurements[1].valid).toBeFalse();
  });

  it("measurement with validator type not equal should be correct", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "notEqualValidator",
            type: results.ValidatorType.NOT_EQUAL,
            value: 100,
            metadata: {},
          },
        ],
        100
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeFalse();
  });

  it("measurement with validator type unspecified should be Valid", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "unspecifiedValidator",
            type: results.ValidatorType.UNSPECIFIED,
            value: undefined,
            metadata: {},
          },
        ],
        100
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeTrue();
  });

  it("measurement with validator type less than should be correct", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "lessThanValidator",
            type: results.ValidatorType.LESS_THAN,
            value: 100,
            metadata: {},
          },
        ],
        99
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeTrue();
  });

  it("measurement with validator type regex should be correct", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "regexValidator",
            type: results.ValidatorType.REGEX_MATCH,
            value: /[A-Z]/g,
            metadata: {},
          },
        ],
        "A"
      ),
      buildMeasurementWithValidators(
        [
          {
            name: "regexValidator",
            type: results.ValidatorType.REGEX_MATCH,
            value: /[A-Z]/g,
            metadata: {},
          },
        ],
        "a"
      ),
      buildMeasurementWithValidators(
        [
          {
            name: "regexNoMatchValidator",
            type: results.ValidatorType.REGEX_NO_MATCH,
            value: /[A-Z]/g,
            metadata: {},
          },
        ],
        "A"
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(teststep.measurements.length).toEqual(3);
    expect(teststep.measurements[0].valid).toBeTrue();
    expect(teststep.measurements[1].valid).toBeFalse();
    expect(teststep.measurements[2].valid).toBeFalse();
  });

  it("measurement with validator type set should be correct", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "inSetValidator",
            type: results.ValidatorType.IN_SET,
            value: [0, 1, 2],
            metadata: {},
          },
        ],
        1
      ),
      buildMeasurementWithValidators(
        [
          {
            name: "notInSetValidator",
            type: results.ValidatorType.NOT_IN_SET,
            value: [0, 1, 2],
            metadata: {},
          },
        ],
        1
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];
    expect(teststep.measurements.length).toEqual(2);
    expect(teststep.measurements[0].valid).toBeTrue();
    expect(teststep.measurements[1].valid).toBeFalse();
  });

  it("measurement which fulfills all validators should be valid", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "lessThanValidator",
            type: results.ValidatorType.LESS_THAN,
            value: 10,
            metadata: {},
          },
          {
            name: "greaterThanValidator",
            type: results.ValidatorType.GREATER_THAN,
            value: 0,
            metadata: {},
          },
        ],
        1
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];
    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeTrue();
  });
  it("measurement which does not fulfill all validators should be invalid", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "lessThanValidator",
            type: results.ValidatorType.LESS_THAN,
            value: 10,
            metadata: {},
          },
          {
            name: "greaterThanValidator",
            type: results.ValidatorType.GREATER_THAN,
            value: 2,
            metadata: {},
          },
        ],
        1
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];
    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeFalse();
  });

  it("measurement with conflicting validators should return false", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      buildMeasurementWithValidators(
        [
          {
            name: "equalValidator",
            type: results.ValidatorType.EQUAL,
            value: 1,
            metadata: {},
          },
          {
            name: "equalValidator",
            type: results.ValidatorType.EQUAL,
            value: 2,
            metadata: {},
          },
        ],
        1
      ),
    ]);
    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];
    expect(teststep.measurements.length).toEqual(1);
    expect(teststep.measurements[0].valid).toBeFalse();
  });

  it("should support measurement series", () => {
    recordService.get.and.returnValue([
      startStepRecord,
      {
        category: "Measurement Series",
        message: "Series_0 my_series Start.",
        raw: {
          sequenceNumber: 26,
          testStepArtifact: {
            measurementSeriesStart: {
              hardwareInfoId: "0",
              name: "my_series",
              unit: "awesomeness 1-10",
              measurementSeriesId: "0",
            },
            testStepId: "0",
          },
          timestamp: "2021-10-12T14:09:43.561559802Z",
        },
        sequenceNumber: 26,
        severity: "INFO",
        stage: "Step 1",
        timestamp: "2021-10-12T14:09:43.561559802Z",
      },
      {
        category: "Measurement Series",
        message: "Series_0[0] = 10",
        raw: {
          sequenceNumber: 27,
          testStepArtifact: {
            measurementSeriesElement: {
              timestamp: "2021-10-12T14:09:43.561848570Z",
              index: 0,
              measurementSeriesId: "0",
              range: { maximum: 10, minimum: 1 },
              value: 10,
            },
            testStepId: "0",
          },
          timestamp: "2021-10-12T14:09:43.561850315Z",
        },
        sequenceNumber: 27,
        severity: "INFO",
        stage: "Step 1",
        timestamp: "2021-10-12T14:09:43.561850315Z",
      },
      {
        category: "Measurement Series",
        message: "Series_0 End. totalMeasurementCount: 1",
        raw: {
          sequenceNumber: 28,
          testStepArtifact: {
            measurementSeriesEnd: {
              measurementSeriesId: "0",
              totalMeasurementCount: 1,
            },
            testStepId: "0",
          },
          timestamp: "2021-10-12T14:09:43.562187050Z",
        },
        sequenceNumber: 28,
        severity: "INFO",
        stage: "Step 1",
        timestamp: "2021-10-12T14:09:43.562187050Z",
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps["0"];

    expect(Object.keys(teststep.measurementSeriesInfos)).toEqual(["0"]);
    expect(teststep.measurementSeriesInfos["0"]).toEqual({
      hardwareInfoId: "0",
      name: "my_series",
      unit: "awesomeness 1-10",
      measurementSeriesId: "0",
    });
    expect(teststep.measurementSeriesElements.length).toEqual(1);
    expect(teststep.measurementSeriesElements[0]).toEqual({
      valid: true,
      hardwareInfoId: "0",
      name: "my_series",
      unit: "awesomeness 1-10",
      timestamp: "2021-10-12T14:09:43.561848570Z",
      index: 0,
      measurementSeriesId: "0",
      range: { maximum: 10, minimum: 1 },
      value: 10,
    });
  });

  it('should support error', () => {
    recordService.get.and.returnValue([
      startStepRecord,
      {
        category: "Error",
        message: "demo-teststep-error-symptom: demo error message.",
        raw: {
          sequenceNumber: 25,
          testStepArtifact: {
            error: {
              message: "demo error message.",
              softwareInfoIds: ["0"],
              symptom: "demo-teststep-error-symptom",
            },
            testStepId: "0",
          },
          timestamp: "2021-10-12T14:09:43.561225362Z",
        },
        sequenceNumber: 25,
        severity: "ERROR",
        stage: "Step 0",
        timestamp: "2021-10-12T14:09:43.561225362Z",
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps['0'];

    expect(teststep.errors.length).toEqual(1);
    expect(teststep.errors[0]).toEqual({
      message: "demo error message.",
      softwareInfoIds: ["0"],
      symptom: "demo-teststep-error-symptom",
    });
  });

  it('should support file', () => {
    recordService.get.and.returnValue([
      startStepRecord,
      {
        'category': 'File',
        'message': 'test_file: This is a test file :)',
        'raw': {
          'sequenceNumber': 20,
          'testStepArtifact': {
            'file': {
              'contentType': 'text/plain',
              'description': 'This is a test file :)',
              'isSnapshot': false,
              'outputPath': 'simple_meltan_test_file.txt',
              'tags': [{ 'tag': 'meltan_example' }],
              'displayName': 'test_file'
            },
            'testStepId': '0'
          },
          'timestamp': '2021-10-12T14:09:43.559254139Z'
        },
        'sequenceNumber': 20,
        'severity': 'INFO',
        'stage': 'Step 0',
        'timestamp': '2021-10-12T14:09:43.559254139Z'
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps['0'];

    expect(teststep.files.length).toEqual(1);
    expect(teststep.files[0]).toEqual({
      'contentType': 'text/plain',
      'description': 'This is a test file :)',
      'isSnapshot': false,
      'outputPath': 'simple_meltan_test_file.txt',
      'tags': [{ 'tag': 'meltan_example' }],
      'displayName': 'test_file'
    });
  });

  it('should support extension', () => {
    recordService.get.and.returnValue([
      startStepRecord,

      {
        'category': 'Extention',
        'message': 'example-artifact-extention1',
        'raw': {
          'sequenceNumber': 22,
          'testStepArtifact': {
            'extension': {
              'extension': { 'key': 'value' },
              'name': 'example-artifact-extention1'
            },
            'testStepId': '0'
          },
          'timestamp': '2021-10-12T14:09:43.560069471Z'
        },
        'sequenceNumber': 22,
        'severity': 'INFO',
        'stage': 'Step 0',
        'timestamp': '2021-10-12T14:09:43.560069471Z'
      },
    ]);

    const service = new TestRunService(recordService);
    const teststep = service.get().steps['0'];

    expect(teststep.extensions.length).toEqual(1);
    expect(teststep.extensions[0]).toEqual({
      'extension': { 'key': 'value' },
      'name': 'example-artifact-extention1'
    });
  });
});

describe('TestRun Service: utilizations', () => {
  const recordService =
    jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });

  it('getTeststep() should return TestStep', () => {
    recordService.get.and.returnValue([
      startStepRecord,
    ]);

    const service = new TestRunService(recordService);

    expect(service.getTestStep('0').name).toEqual('my_first_step');
  });

  it('getHardwareComponent() should return HardwareComponent', () => {
    recordService.get.and.returnValue([startRunRecord]);

    const service = new TestRunService(recordService);

    expect(service.getHardwareComponent('0').name).toEqual('myName');
  });
});
