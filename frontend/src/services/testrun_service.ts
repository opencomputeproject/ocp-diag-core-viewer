import { Injectable } from "@angular/core";

import { ResultRecord, ResultRecordService } from "./result_record_service";
import * as results from "./results_type";
import { BehaviorSubject } from "rxjs";

/** Hardware infomation with hostname */
export type Hardware = results.HardwareInfo & {
  hostname: string;
};

/** Software infomation with hostname */
export type Software = results.SoftwareInfo & {
  hostname: string;
};

/** Organized meltan testrun result */
export class TestRun {
  name = "";
  version = "";
  startTime = "";
  endTime = "";
  result: results.Result = "NOT_APPLICABLE";
  status: results.Status = "UNKNOWN";
  parameters: object = {};
  errors: results.Error[] = [];
  tags: string[] = [];
  /** Maps testStepId to TestStep **/
  steps: Record<string, TestStep> = {};
  /** Maps hardwareInfoId to Hardware */
  hardwareInfos: Record<string, Hardware> = {};
  /** Maps softwareInfoId to Software */
  softwareInfos: Record<string, Software> = {};
  /** Maps dutInfoId to platform info */
  platformInfos: results.PlatformInfo[] = [];
}

/** Measurement with validation. **/
export interface Measurement extends results.Measurement {
  /** Whether the value of the measurement is valid **/
  valid: boolean;
}

/** Organized meltan teststep result */
export class TestStep {
  testStepId = "";
  name = "";
  startTime = "";
  endTime = "";
  status: results.Status = "UNKNOWN";
  diagnoses: results.Diagnosis[] = [];
  measurements: Measurement[] = [];
  /** Maps measurementSeriesId to results.MeasurementSeriesStart */
  measurementSeriesInfos: Record<string, results.MeasurementSeriesStart> = {};
  measurementSeriesElements: Measurement[] = [];
  errors: results.Error[] = [];
  tags: string[] = [];
  files: results.File[] = [];
  extensions: results.ArtifactExtension[] = [];
  failure = false;
}

/**
 * A service that provides the meltan testrun result.
 * Organizes the meltan result records into TestRun.
 */
@Injectable()
export class TestRunService {
  testRun: TestRun;
  private dataReadySubject = new BehaviorSubject<boolean>(false);
  dataReady$ = this.dataReadySubject.asObservable();

  constructor(private readonly resultRecordService: ResultRecordService) {
    this.testRun = this.createTestRun(this.resultRecordService.get());
    this.resultRecordService.dataReady$.subscribe(newVal => {
      if (newVal) {
        this.testRun = this.createTestRun(this.resultRecordService.get());
        this.dataReadySubject.next(newVal);
      }
    });
  }

  /** Returns organiazed TestRun result */
  get() {
    return this.testRun;
  }

  getTestStep(testStepId: string): TestStep {
    return this.testRun.steps[testStepId];
  }

  getHardwareComponent(hardwareInfoId: string): Hardware {
    return this.testRun.hardwareInfos[hardwareInfoId];
  }

  private createTestRun(records: ResultRecord[]): TestRun {
    let testrun = new TestRun();

    for (const record of records) {
      if (record.category === "Log") {
        continue;
      }
      if (record.raw.testRunArtifact) {
        testrun = this.processRunRecord(
          record,
          record.raw.testRunArtifact,
          testrun
        );
      } else if (record.raw.testStepArtifact) {
        testrun = this.processStepRecord(
          record,
          record.raw.testStepArtifact,
          testrun
        );
      }
    }
    return testrun;
  }

  private processRunRecord(
    record: ResultRecord,
    artifact: results.TestRunArtifact,
    testrun: TestRun
  ): TestRun {
    if (artifact.testRunStart) {
      return this.processTestRunStartRunRecord(
        record,
        artifact.testRunStart,
        testrun
      );
    }

    if (artifact.testRunEnd) {
      return this.processTestRunEndRecord(record, artifact.testRunEnd, testrun);
    }

    if (artifact.error) {
      testrun.errors.push(artifact.error);
      return testrun;
    }

    if (artifact.tag) {
      testrun.tags.push(artifact.tag.tag);
      return testrun;
    }
    return testrun;
  }

  private processTestRunStartRunRecord(
    record: ResultRecord,
    testRunStart: results.TestRunStart,
    testrun: TestRun
  ): TestRun {
    testrun.name = testRunStart.name;
    testrun.version = testRunStart.version;
    testrun.parameters = testRunStart.parameters;
    testrun.startTime = record.raw.timestamp;

    for (const dut of testRunStart.dutInfo) {
      if (dut.hardwareInfos) {
        for (const hw of dut.hardwareInfos) {
          testrun.hardwareInfos[hw.hardwareInfoId] = {
            hostname: dut.hostname,
            ...hw,
          };
        }
      }
      if (dut.softwareInfos) {
        for (const sw of dut.softwareInfos) {
          testrun.softwareInfos[sw.softwareInfoId] = {
            hostname: dut.hostname,
            ...sw,
          };
        }
      }
      if (dut.platformInfos) {
        testrun.platformInfos = dut.platformInfos;
      }
    }
    return testrun;
  }

  private processTestRunEndRecord(
    record: ResultRecord,
    testRunEnd: results.TestRunEnd,
    testrun: TestRun
  ): TestRun {
    testrun.endTime = record.timestamp;
    testrun.status = testRunEnd.status;
    testrun.result = testRunEnd.result;
    return testrun;
  }

  private processStepRecord(
    record: ResultRecord,
    artifact: results.TestStepArtifact,
    testrun: TestRun
  ): TestRun {
    if (artifact.testStepStart) {
      const teststep = new TestStep();
      teststep.testStepId = artifact.testStepId;
      testrun.steps[artifact.testStepId] = this.processTestStepStart(
        record,
        artifact.testStepStart,
        teststep
      );
      return testrun;
    }

    if (artifact.testStepEnd) {
      testrun.steps[artifact.testStepId] = this.processTestStepEnd(
        record,
        artifact.testStepEnd,
        testrun.steps[artifact.testStepId]
      );
      return testrun;
    }

    if (artifact.diagnosis) {
      if (artifact.diagnosis.type === "FAIL") {
        testrun.steps[artifact.testStepId].failure = true;
      }
      testrun.steps[artifact.testStepId].diagnoses.push(artifact.diagnosis);
      return testrun;
    }

    if (artifact.measurement) {
      const valid = this.measurementValidate(artifact.measurement);
      if (!valid) {
        testrun.steps[artifact.testStepId].failure = true;
      }
      testrun.steps[artifact.testStepId].measurements.push({
        valid,
        ...artifact.measurement,
      });
      return testrun;
    }

    if (artifact.measurementSeriesStart) {
      testrun.steps[artifact.testStepId].measurementSeriesInfos[
        artifact.measurementSeriesStart.measurementSeriesId
      ] = artifact.measurementSeriesStart;
      return testrun;
    }

    if (artifact.measurementSeriesElement) {
      testrun.steps[artifact.testStepId] = this.processMeasurementSeriesElement(
        record,
        artifact.measurementSeriesElement,
        testrun.steps[artifact.testStepId]
      );
      return testrun;
    }

    if (artifact.error) {
      testrun.steps[artifact.testStepId].errors.push(artifact.error);
      return testrun;
    }

    if (artifact.file) {
      testrun.steps[artifact.testStepId].files.push(artifact.file);
      return testrun;
    }

    if (artifact.extension) {
      testrun.steps[artifact.testStepId].extensions.push(artifact.extension);
      return testrun;
    }
    return testrun;
  }

  private processTestStepStart(
    record: ResultRecord,
    testStepStart: results.TestStepStart,
    teststep: TestStep
  ): TestStep {
    teststep.name = testStepStart.name;
    teststep.startTime = record.timestamp;
    return teststep;
  }

  private processTestStepEnd(
    record: ResultRecord,
    testStepEnd: results.TestStepEnd,
    teststep: TestStep
  ): TestStep {
    teststep.endTime = record.timestamp;
    teststep.status = testStepEnd.status;
    return teststep;
  }

  private processMeasurementSeriesElement(
    record: ResultRecord,
    element: results.MeasurementElement,
    teststep: TestStep
  ): TestStep {
    const valid = this.measurementValidate(element);
    if (!valid) {
      teststep.failure = true;
    }
    teststep.measurementSeriesElements.push({
      valid,
      ...element,
      ...teststep.measurementSeriesInfos[element.measurementSeriesId],
    });
    return teststep;
  }

  /**
   * Validates `element` value is one of `element.validValues.values` or
   * within `element.range`.
   */
  private measurementValidate(element: {
    value: any;
    range?: results.MeasurementElementRange;
    validValues?: results.MeasurementElementValidValues;
    validators?: results.Validator[];
  }) {
    if (element?.validValues) {
      for (const v of element.validValues.values) {
        if (JSON.stringify(element.value) === JSON.stringify(v)) {
          return true;
        }
      }
      return false;
    }
    if (element?.range?.maximum != undefined && element.range.maximum < element.value) {
      return false;
    }
    if (element?.range?.minimum != undefined && element.range.minimum > element.value) {
      return false;
    }
    return this.measurementValidateOCP(element);
  }

  private measurementValidateOCP(element: {
    value: any;
    validators?: results.Validator[];
  }) {
    if (element.validators) {
      for (const validator of element.validators) {
        switch (validator.type) {
          case results.ValidatorType.UNSPECIFIED:
            continue;
          case results.ValidatorType.EQUAL:
            if (element.value != validator.value) return false;
            continue;
          case results.ValidatorType.NOT_EQUAL:
            if (element.value == validator.value) return false;
            continue;
          case results.ValidatorType.LESS_THAN:
            if (element.value >= validator.value) return false;
            continue;
          case results.ValidatorType.LESS_THAN_OR_EQUAL:
            if (element.value > validator.value) return false;
            continue;
          case results.ValidatorType.GREATER_THAN:
            if (element.value <= validator.value) return false;
            continue;
          case results.ValidatorType.GREATER_THAN_OR_EQUAL:
            if (element.value < validator.value) return false;
            continue;
          case results.ValidatorType.REGEX_MATCH:
            if (!element.value.match(validator.value)) return false;
            continue;
          case results.ValidatorType.REGEX_NO_MATCH:
            if (element.value.match(validator.value)) return false;
            continue;
          case results.ValidatorType.IN_SET:
            if (!validator.value.includes(element.value)) return false;
            continue;
          case results.ValidatorType.NOT_IN_SET:
            if (validator.value.includes(element.value)) return false;
            continue;
        }
      }
    }
    return true;
  }
}
