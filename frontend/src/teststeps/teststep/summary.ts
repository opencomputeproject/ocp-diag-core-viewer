import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {Subscription} from 'rxjs';

import {Error, File, Tag} from '../../services/results_type';
import {TestRunService, TestStep} from '../../services/testrun_service';
import {TimezoneService} from '../../services/timezone_service';
import {calulateDurationOrShowMessage} from '../../utility/utils';

/**
 *  The Teststep summary tab.
 */
@Component({
  selector: 'teststeps-teststep-summary',
  templateUrl: 'summary.ng.html',
  styleUrls: ['summary.css']
})
export class SummaryComponent implements OnInit, OnDestroy {
  @Input() testStepId = '';
  teststep!: TestStep;
  summary: Array<[string, unknown]> = [];
  errorsDataSource!: MatTableDataSource<Error>;
  filesTableDataSource!: MatTableDataSource<File>;
  filesTableDisplayedColumns = [
    'displayName',
    'description',
    'outputPath',
    'tags',
  ];
  extentions: Array<[string, unknown]> = [];

  @ViewChild(MatSort) errorsSort!: MatSort;
  @ViewChild(MatSort) filesTableSort!: MatSort;

  private timezoneSubscription?: Subscription;

  constructor(
    private readonly testrunService: TestRunService,
    private readonly timezoneService: TimezoneService) {}

  ngOnInit() {
    this.teststep = this.testrunService.getTestStep(this.testStepId);
    // initSummary() is also called right away with the current timezone.
    this.timezoneSubscription = this.timezoneService.timezone$.subscribe(() => {
      this.initSummary();
    });

    // Errors table
    this.errorsDataSource = new MatTableDataSource(this.teststep.errors);
    this.errorsDataSource.sort = this.errorsSort;

    // Files table
    this.filesTableDataSource = new MatTableDataSource(this.teststep.files);
    this.filesTableDataSource.sort = this.filesTableSort;

    // Extentions
    this.initExtentions();
  }

  ngOnDestroy() {
    this.timezoneSubscription?.unsubscribe();
  }

  tagslist(tags: Tag[]): string {
    return tags.map(n => n.tag).join(', ');
  }

  private initSummary() {
    this.summary = [];
    this.summary.push(['Id', this.teststep.testStepId]);
    this.summary.push(['Name', this.teststep.name]);
    this.summary.push(['Status', this.teststep.status]);
    this.summary.push(['Errors', this.teststep.errors.length]);
    this.summary.push(['Diagnoses', this.teststep.diagnoses.length]);
    this.summary.push(['Measurements', this.teststep.measurements.length]);
    this.summary.push([
      'Measurement Series',
      Object.keys(this.teststep.measurementSeriesInfos).length
    ]);
    this.summary.push([
      'Measurement Series Elements',
      this.teststep.measurementSeriesElements.length
    ]);
    this.summary.push(
      ['Start Time', this.timezoneService.format(this.teststep.startTime)]);
    this.summary.push(
      ['End Time', this.timezoneService.format(this.teststep.endTime)]);
    this.summary.push([
      'Duration',
      calulateDurationOrShowMessage(this.teststep.startTime, this.teststep.endTime)
    ]);
  }

  private initExtentions() {
    this.extentions = [];
    for (const extention of this.teststep.extensions) {
      this.extentions.push([extention.name, extention.extension]);
    }
  }
}
