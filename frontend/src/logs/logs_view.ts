import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ResultRecord, ResultRecordService } from '../services/result_record_service';
import { SEVERITIES, Severity } from '../services/results_type';
import { TestRunService } from '../services/testrun_service';

/**
 *  The log view page.
 *
 *  It contains a result record table with a severity selector and a search
 *  keyword input.
 *
 *  Example:
 *  <logs-view></logs-view>
 */
@Component({
  selector: 'logs-view',
  templateUrl: './logs_view.ng.html',
  styleUrls: ['./logs_view.css'],
})
export class LogsViewComponent implements AfterViewInit {
  toggleAllPanels = false;
  dataSource = new MatTableDataSource<ResultRecord>();
  severities = SEVERITIES;
  severity: Severity = 'DEBUG';
  searchKeyword = '';
  readonly displayedColumns: string[] = [
    'sequenceNumber',
    'timestamp',
    'severity',
    'stage',
    'stepName',
    'category',
    'message',
    'json',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly service: ResultRecordService,
    private readonly testrunService: TestRunService) { }


  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.service.dataReady$.subscribe(newVal => {
      if (newVal) {
        this.loadResultRecords();
      }
    })
  }

  loadResultRecords() {
    this.dataSource.data = this.service.get(this.severity, this.searchKeyword);
  }

  severityClass(record: ResultRecord) {
    return `log-severity-${record.severity}`.toLowerCase();
  }

  getStepName(record: ResultRecord) {
    if (record.raw.testStepArtifact == null) {
      return '';
    }
    return this.testrunService
      .getTestStep(record.raw.testStepArtifact.testStepId)
      .name;
  }
}
