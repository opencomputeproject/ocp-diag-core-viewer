import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { ErrorsTableComponent } from '../components/errors_table/errors_table';
import { FailuresTableComponent } from '../components/failures_table/failures_table';
import { ParametersViewerComponent } from '../components/parameters_viewer/parameters_viewer';
import { SessionTitleBarComponent } from '../components/session_title_bar/session_title_bar';
import { ResultRecordService } from '../services/result_record_service';
import { SideInfoService } from '../services/side_info_service';
import { TestRun, TestRunService } from '../services/testrun_service';

import { TestrunModule } from './testrun_module';
import { TestRunViewComponent } from './testrun_view';
import { BehaviorSubject } from 'rxjs';

describe('TestRunViewComponent Loading', () => {
  const dataReadySubject = new BehaviorSubject<boolean>(false);
  const dataReady$ = dataReadySubject.asObservable();
  const testRunService =
    jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });
  const defaultTestRun: TestRun = {
    ...new TestRun(),
    startTime: '2021-10-12T14:09:43.549303038Z',
    endTime: '2021-10-12T14:19:43.549303038Z',
  };

  let fixture: ComponentFixture<TestRunViewComponent>;

  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestRunViewComponent],
      imports: [
        TestrunModule,
        RouterTestingModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
      providers: [
        ResultRecordService,
        SideInfoService,
        { provide: TestRunService, useValue: testRunService },
      ],
    });
  });
  it('should hide summary table before data is ready', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#summary-table')).toBeFalsy();
  });
})

describe('TestRunViewComponent Component', () => {
  const dataReadySubject = new BehaviorSubject<boolean>(true);
  const dataReady$ = dataReadySubject.asObservable();
  const testRunService =
    jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });

  const defaultTestRun: TestRun = {
    ...new TestRun(),
    startTime: '2021-10-12T14:09:43.549303038Z',
    endTime: '2021-10-12T14:19:43.549303038Z',
  };

  let fixture: ComponentFixture<TestRunViewComponent>;

  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestRunViewComponent],
      imports: [
        TestrunModule,
        RouterTestingModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
      providers: [
        ResultRecordService,
        SideInfoService,
        { provide: TestRunService, useValue: testRunService },
      ],
    });
  });

  it('should be created', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should have a summary table', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#summary-table')).toBeTruthy();
  });

  it('should have a summary table', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#summary-table')).toBeTruthy();
  });

  it('should have an empty parameters viewer', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    const paramsEl =
      fixture.debugElement.query(By.directive(ParametersViewerComponent));
    expect(paramsEl).toBeTruthy();
    expect(paramsEl.componentInstance.parameters).toEqual({});
    expect(paramsEl.componentInstance.hasParameters).toBeFalse();
  });

  it('should pass testrun parameters to parameters viewer', () => {
    const parameters = {
      foo: 'bar',
      count: 42,
      nested: { a: 1 },
    };
    testRunService.get.and.returnValue({
      ...defaultTestRun,
      parameters,
    });
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    const paramsEl =
      fixture.debugElement.query(By.directive(ParametersViewerComponent));
    expect(paramsEl).toBeTruthy();
    expect(paramsEl.componentInstance.parameters).toEqual(parameters);
    expect(paramsEl.componentInstance.hasParameters).toBeTrue();
  });

  it('should hide the failures section when there are no failures', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    const titleBarEl = fixture.debugElement
      .queryAll(By.directive(SessionTitleBarComponent))
      .find(el => el.componentInstance.title === 'Failures');
    expect(titleBarEl).toBeUndefined();
    expect(fixture.debugElement.query(By.directive(FailuresTableComponent)))
      .toBeNull();
  });

  it('should show the failures section when there are failures', () => {
    testRunService.get.and.returnValue({
      ...defaultTestRun,
      failures: [
        {
          testStepId: '1',
          testStepName: 'Measure InternodeBandwidth',
          symptom: 'Measure InternodeBandwidth - bad-bandwidth',
          message: 'Nothing really',
          hardwareInfoId: ['0'],
        },
      ],
      hardwareInfos: {
        0: {
          hostname: 'dut',
          hardwareInfoId: '0',
          arena: '',
          name: 'cpu0',
          partNumber: 'cpu0_part',
          manufacturer: 'MFG',
          partType: 'cpu',
          mfgPartNumber: '',
          fruLocation: {
            devpath: '/path/to/CPU',
            odataId: '',
            blockpath: '',
            serialNumber: 'cpu0_serial',
          },
          componentLocation: {
            devpath: '/path/to/CPU',
            odataId: '',
            blockpath: '',
            serialNumber: '',
          },
        },
      },
    });
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    const titleBarEl = fixture.debugElement
      .queryAll(By.directive(SessionTitleBarComponent))
      .find(el => el.componentInstance.title === 'Failures');
    expect(titleBarEl?.componentInstance.badge).toBe(1);

    const tableEl =
      fixture.debugElement.query(By.directive(FailuresTableComponent));
    expect(tableEl).toBeTruthy();
    expect(tableEl.componentInstance.dataSource.data).toHaveSize(1);
  });

  it('should have an empty errors table', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    // Badge should be 0.
    const titleBarEl = fixture.debugElement
      .queryAll(By.directive(SessionTitleBarComponent))
      .find(el => el.componentInstance.title === 'Errors');
    expect(titleBarEl?.componentInstance.badge).toBe(0);

    // Empty error table.
    const tableEl = fixture.debugElement.query(By.directive(ErrorsTableComponent));
    expect(tableEl.componentInstance.dataSource.data).toHaveSize(0);
  });

  it('should have an two errors in the errors table', () => {
    testRunService.get.and.returnValue({
      ...defaultTestRun,
      errors: [
        {
          symptom: "symptom 1",
          msg: "message 1",
          softwareInfoIds: ["0", "1"],
        },
        {
          symptom: "symptom 2",
          msg: "message 2",
          softwareInfoIds: ["0"],
        },
      ],
      softwareInfos: {
        0: {
          hostname: "host",
          software: {
            softwareInfoId: "0",
            arena: "",
            name: "sw0",
            version: "",
          },
        },
        1: {
          hostname: "host",
          software: {
            softwareInfoId: "1",
            arena: "",
            name: "sw1",
            version: "",
          },
        },
      },
    });
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    // Badge should be 2.
    const titleBarEl = fixture.debugElement
      .queryAll(By.directive(SessionTitleBarComponent))
      .find(el => el.componentInstance.title === 'Errors');
    expect(titleBarEl?.componentInstance.badge).toBe(2);

    // There are 2 rows in table.
    const tableEl = fixture.debugElement.query(By.directive(ErrorsTableComponent));
    expect(tableEl.componentInstance.dataSource.data).toHaveSize(2);
  });
});
