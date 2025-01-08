import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ResultRecord, ResultRecordService } from '../services/result_record_service';
import { SEVERITIES } from '../services/results_type';
import { TestRunService } from '../services/testrun_service';

import { LogsModule } from './logs_module';
import { LogsViewComponent } from './logs_view';
import { BehaviorSubject } from 'rxjs';

const dataReadySubject = new BehaviorSubject<boolean>(true);
const dataReady$ = dataReadySubject.asObservable();
describe('LogsViewComponent Component', () => {
  let recordService: jasmine.SpyObj<ResultRecordService>;

  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    recordService = jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });

    TestBed.configureTestingModule({
      declarations: [LogsViewComponent],
      imports: [
        LogsModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
      providers: [
        TestRunService,
        { provide: ResultRecordService, useValue: recordService },
      ],
    });
  });

  it('should be created', () => {
    recordService.get.and.returnValue([]);

    const fixture = TestBed.createComponent(LogsViewComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
    expect(recordService.get).toHaveBeenCalled();
  });

  it('should have records in the table', () => {
    const meltanRecords: ResultRecord[] = [
      {
        category: 'Log',
        message: 'TestRun demo DEBUG log.',
        sequenceNumber: 0,
        severity: 'DEBUG',
        stage: 'Run',
        timestamp: '2021-10-12T14:09:43.546167417Z',
        raw: {
          sequenceNumber: 0,
          timestamp: '2021-10-12T14:09:43.546167417Z',
        },
      },
      {
        category: 'Log',
        message: 'TestRun demo INFO log.',
        sequenceNumber: 1,
        severity: 'INFO',
        stage: 'Run',
        timestamp: '2021-10-12T14:09:43.546167417Z',
        raw: {
          sequenceNumber: 1,
          timestamp: '2021-10-12T14:09:43.546167417Z',
        },
      },
    ];
    recordService.get.and.returnValue(meltanRecords);

    const fixture = TestBed.createComponent(LogsViewComponent);
    expect(fixture.componentInstance).toBeTruthy();
    expect(recordService.get).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('tbody')).toBeNull();

    fixture.componentInstance.ngAfterViewInit();
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('tbody')
      .querySelectorAll('tr')
      .length)
      .toEqual(2);
  });

  it('should have sevierity style on the rows', () => {
    const meltanRecords: ResultRecord[] = [];
    for (const [i, severity] of SEVERITIES.entries()) {
      meltanRecords.push({
        sequenceNumber: i,
        category: 'Log',
        message: 'log',
        severity,
        stage: 'Run',
        timestamp: '2021-10-12T14:09:43.546167417Z',
        raw: {
          sequenceNumber: i,
          timestamp: '2021-10-12T14:09:43.546167417Z',
        },
      });
    }
    recordService.get.and.returnValue(meltanRecords);

    const fixture = TestBed.createComponent(LogsViewComponent);
    fixture.componentInstance.ngAfterViewInit();
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
    for (const [i, severity] of SEVERITIES.entries()) {
      expect(fixture.nativeElement.querySelector('tbody')
        .querySelectorAll('tr')[i]
        .classList.contains(`log-severity-${severity}`.toLowerCase()))
        .toBeTrue();
    }
  });
});

describe('Severity Selector', () => {
  let recordService: jasmine.SpyObj<ResultRecordService>;
  let fixture: ComponentFixture<LogsViewComponent>;
  let loader: HarnessLoader;
  let select: MatSelectHarness;

  beforeEach(() => {
    recordService = jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });
    recordService.get.and.returnValue([]);

    TestBed.configureTestingModule({
      declarations: [LogsViewComponent],
      imports: [
        LogsModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
      providers: [
        TestRunService,
        { provide: ResultRecordService, useValue: recordService },
      ],
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(LogsViewComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    select = await loader.getHarness(
      MatSelectHarness.with({ selector: '#severity-selector' }));
  });

  it('should be default to DEBUG', async () => {
    expect(await select.getValueText()).toBe('DEBUG');
  });

  it('should be able to get options', async () => {
    await select.open();
    const options = await select.getOptions();

    expect(options.length).toBe(SEVERITIES.length);
  });

  it('should be able to select the severity', async () => {
    await select.open();
    const options = await select.getOptions();

    await options[2].click();

    expect(await select.getValueText()).toBe('INFO');
    expect(recordService.get).toHaveBeenCalledWith('INFO', jasmine.any(String));
  });
});

describe('Search Input', () => {
  let recordService: jasmine.SpyObj<ResultRecordService>;
  let fixture: ComponentFixture<LogsViewComponent>;
  let loader: HarnessLoader;
  let input: MatInputHarness;

  beforeEach(() => {
    recordService = jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });
    recordService.get.and.returnValue([]);

    TestBed.configureTestingModule({
      declarations: [LogsViewComponent],
      imports: [
        LogsModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
      providers: [
        TestRunService,
        { provide: ResultRecordService, useValue: recordService },
      ],
    });
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(LogsViewComponent);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    input = await loader.getHarness(
      MatInputHarness.with({ selector: '#search-input' }));
  });

  it('should be default to empty', async () => {
    expect(await input.getValue()).toBe('');
  });

  it('should be able to search for keywords', async () => {
    await input.setValue('keyword');

    expect(recordService.get)
      .toHaveBeenCalledWith(jasmine.any(String), 'keyword');
  });
});

describe('Expand Panel Button', () => {
  let recordService: jasmine.SpyObj<ResultRecordService>;
  let fixture: ComponentFixture<LogsViewComponent>;
  let loader: HarnessLoader;
  let button: MatButtonHarness;
  let panel: MatExpansionPanelHarness;

  beforeEach(async () => {
    recordService = jasmine.createSpyObj('mockResultRecordService', ['get'], { 'dataReady$': dataReady$ });

    TestBed.configureTestingModule({
      declarations: [LogsViewComponent],
      imports: [
        LogsModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
      providers: [
        TestRunService,
        { provide: ResultRecordService, useValue: recordService },
      ],
    });
    const meltanRecords: ResultRecord[] = [
      {
        category: 'Log',
        message: 'TestRun demo DEBUG log.',
        sequenceNumber: 0,
        severity: 'DEBUG',
        stage: 'Run',
        timestamp: '2021-10-12T14:09:43.546167417Z',
        raw: {
          sequenceNumber: 0,
          timestamp: '2021-10-12T14:09:43.546167417Z',
        },
      },
    ];

    recordService.get.and.returnValue(meltanRecords);

    fixture = TestBed.createComponent(LogsViewComponent);
    fixture.componentInstance.ngAfterViewInit();
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    button = await loader.getHarness(MatButtonHarness);
    panel = await loader.getHarness(MatExpansionPanelHarness);
  });

  it('should be able to toggle panel', async () => {
    expect(await button.getText()).toBe('Expand All');
    expect(await panel.isExpanded()).toBe(false);

    await button.click();

    expect(await button.getText()).toBe('Collapse All');
    expect(await panel.isExpanded()).toBe(true);
  });
});
