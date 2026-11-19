import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { SideInfoService } from '../../services/side_info_service';
import { Failure, TestRunService } from '../../services/testrun_service';

/**
 * FailuresTable lists FAIL diagnoses across test steps in a TestRun.
 */
@Component({
  selector: 'failures-table',
  templateUrl: './failures_table.ng.html',
  styleUrls: ['./failures_table.css'],
})
export class FailuresTableComponent implements AfterViewInit {
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  readonly displayedColumns = ['symptom', 'message', 'hardwareInfo'];
  private failuresDataSource = new MatTableDataSource<Failure>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private readonly testrunService: TestRunService,
    readonly sideInfoService: SideInfoService) {}

  @Input()
  get dataSource(): MatTableDataSource<Failure> {
    return this.failuresDataSource;
  }
  set dataSource(value: MatTableDataSource<Failure>) {
    this.failuresDataSource = value ?? new MatTableDataSource<Failure>();
    this.attachTableControls();
  }

  ngAfterViewInit() {
    this.attachTableControls();
  }

  getHardwareInfoName(hardwareId: string) {
    return this.testrunService.get().hardwareInfos[hardwareId]?.name ?? '';
  }

  private attachTableControls() {
    if (this.sort) {
      this.failuresDataSource.sort = this.sort;
    }
    if (this.paginator) {
      this.failuresDataSource.paginator = this.paginator;
    }
  }
}
