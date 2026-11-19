import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { MatTableDataSource } from '@angular/material/table';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { SideInfoService } from '../../services/side_info_service';
import { Failure, Hardware, TestRun, TestRunService } from '../../services/testrun_service';

import { FailuresTableComponent } from './failures_table';
import { FailuresTableModule } from './failures_table_module';

@Component({ template: '' })
class DummyTestStepComponent { }

describe('FailuresTable Component', () => {
  let fixture: ComponentFixture<FailuresTableComponent>;
  let component: FailuresTableComponent;
  let loader: HarnessLoader;
  let testRunService: jasmine.SpyObj<TestRunService>;
  let sideInfoService: jasmine.SpyObj<SideInfoService>;

  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    testRunService = jasmine.createSpyObj('TestRunService', ['get']);
    sideInfoService =
      jasmine.createSpyObj('SideInfoService', ['showHardwareInfo']);

    testRunService.get.and.returnValue({
      ...new TestRun(),
      hardwareInfos: {
        0: { hardwareInfoId: '0', name: 'cpu0' } as Hardware,
        1: { hardwareInfoId: '1', name: 'cpu1' } as Hardware,
      },
    });

    TestBed.configureTestingModule({
      declarations: [DummyTestStepComponent],
      imports: [
        FailuresTableModule,
        RouterTestingModule.withRoutes([
          { path: 'teststeps/:testStepId', component: DummyTestStepComponent },
        ]),
        NoopAnimationsModule,
      ],
      providers: [
        { provide: TestRunService, useValue: testRunService },
        { provide: SideInfoService, useValue: sideInfoService },
      ],
    });

    fixture = TestBed.createComponent(FailuresTableComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render symptom link, message, and hardware info and navigate to teststep', async () => {
    component.dataSource = new MatTableDataSource<Failure>([
      {
        testStepId: '1',
        testStepName: 'Measure InternodeBandwidth',
        symptom: 'Measure InternodeBandwidth - bad-bandwidth',
        message: 'Nothing really',
        hardwareInfoId: ['0', '1'],
      },
    ]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows).toHaveSize(1);

    const symptomLink: HTMLAnchorElement = rows[0].querySelector('a.symptom-link');
    expect(symptomLink.textContent?.trim())
      .toBe('Measure InternodeBandwidth - bad-bandwidth');
    expect(symptomLink.getAttribute('href')).toBe('/teststeps/1');

    expect(rows[0].querySelector('td.mat-column-message').textContent.trim())
      .toBe('Nothing really');

    const hwLinks: NodeListOf<HTMLAnchorElement> =
      rows[0].querySelectorAll('li.info-list-item a');
    expect(hwLinks).toHaveSize(2);
    expect(hwLinks[0].textContent?.trim()).toBe('cpu0');
    expect(hwLinks[1].textContent?.trim()).toBe('cpu1');
    hwLinks[0].click();
    expect(sideInfoService.showHardwareInfo).toHaveBeenCalledWith('0');

    symptomLink.click();
    await fixture.whenStable();
    const location = TestBed.inject(Location);
    expect(location.path()).toBe('/teststeps/1');
  });

  it('should paginate failures at 10 per page by default', async () => {
    const failures: Failure[] = Array.from({ length: 15 }, (_, i) => ({
      testStepId: `${i}`,
      testStepName: `step_${i}`,
      symptom: `step_${i} - fault_${i}`,
      message: `msg ${i}`,
      hardwareInfoId: [],
    }));
    component.dataSource = new MatTableDataSource<Failure>(failures);
    fixture.detectChanges();

    const paginator = await loader.getHarness(MatPaginatorHarness);
    expect(await paginator.getPageSize()).toBe(10);
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveSize(10);

    await paginator.goToNextPage();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveSize(5);
  });
});
