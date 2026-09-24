import {AfterViewInit, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

import {TestRunService, TestStep} from '../services/testrun_service';
import {timeDiff, calulateDurationOrShowMessage} from '../utility/utils';


/**
 * TestSteps list table
 */
@Component({
  selector: 'teststeps-list',
  styleUrls: ['teststeps_list.css'],
  templateUrl: 'teststeps_list.ng.html',
  encapsulation: ViewEncapsulation.None,
})
export class TestStepsListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'testStepId',
    'statusIcon',
    'name',
    'errors',
    'diagnoses',
    'measurements',
    'measurementSeriesInfos',
    'measurementSeriesElements',
    'status',
    'startTime',
    'duration',
  ];
  dataSource: MatTableDataSource<TestStep>;
  objectKeys = Object.keys;
  timeDiff = timeDiff;
  calulateDurationOrShowMessage = calulateDurationOrShowMessage;

  @ViewChild(MatSort) sort!: MatSort;


  constructor(private readonly testrunService: TestRunService) {
    this.dataSource = new MatTableDataSource<TestStep>(
      Object.values(this.testrunService.get().steps));
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
