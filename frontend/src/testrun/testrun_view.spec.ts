import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ErrorsTableComponent } from '../components/errors_table/errors_table';
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

  it('should have an empty errors table', () => {
    testRunService.get.and.returnValue(defaultTestRun);
    fixture = TestBed.createComponent(TestRunViewComponent);
    fixture.detectChanges();

    // Badge should be 0.
    const titleBarEl =
      fixture.debugElement.query(By.directive(SessionTitleBarComponent));
    expect(titleBarEl.componentInstance.badge).toBe(0);

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
    const titleBarEl =
      fixture.debugElement.query(By.directive(SessionTitleBarComponent));
    expect(titleBarEl.componentInstance.badge).toBe(2);

    // There are 2 rows in table.
    const tableEl = fixture.debugElement.query(By.directive(ErrorsTableComponent));
    expect(tableEl.componentInstance.dataSource.data).toHaveSize(2);
  });
});
