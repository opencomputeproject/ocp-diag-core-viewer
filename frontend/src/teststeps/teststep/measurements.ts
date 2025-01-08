import { Component, Input, OnInit } from '@angular/core';
import { Sort } from '@angular/material/sort';

import {
  MeasurementElementRange,
  MeasurementElementValidValues,
  MeasurementSeriesStart,
  Validator,
  ValidatorType,
} from "../../services/results_type";
import { SideInfoService } from "../../services/side_info_service";
import {
  Measurement,
  TestRunService,
  TestStep,
} from "../../services/testrun_service";
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

interface MeasurementSeriesOption {
  measurementName: string;
  text: string;
  measurementSeriesId: string;
}

function compare<T>(a: T, b: T, isAsc: boolean) {
  if (a === b) {
    return 0;
  }
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

/**
 *  The Teststep measurements tab.
 */
@Component({
  selector: "teststeps-teststep-measurements",
  templateUrl: "measurements.ng.html",
  styleUrls: ["measurements.css"],
})

export class MeasurementsComponent implements OnInit {
  // original data
  @Input() dataSource: Measurement[] = [];
  @Input() showSeries = false;
  @Input() measurementSeriesInfos: Record<string, MeasurementSeriesStart> = {};
  teststep!: TestStep;
  // total data after filtering/sorting
  measurementsDataSource: Measurement[] = [];
  // the data being visible in the table (after paginating)
  measurementsTableDataSource = new MatTableDataSource<Measurement>();
  measurementSeriesOptions: MeasurementSeriesOption[] = [];
  totalDataLength = 0;
  currentPageSize = 50;
  currentPage = 0;
  displayedColumns = [
    "name",
    "value",
    "unit",
    "hardwareInfo",
    "validIcon",
    "validValues",
  ];
  selectedSeriesId = "";
  sort!: Sort;

  constructor(
    private readonly testrunService: TestRunService,
    readonly sideInfoService: SideInfoService
  ) {
  }

  ngOnInit() {
    if (this.showSeries) {
      this.displayedColumns = ["id", "index"].concat(this.displayedColumns);
    }
  }
  ngAfterContentInit() {
    this.totalDataLength = this.dataSource.length;
    this.measurementsDataSource = this.dataSource.slice();
    this.measurementsTableDataSource.data = this.dataSource.slice(0, this.currentPageSize);
    this.initMeasurementSeriesOptions(this.measurementSeriesInfos);
  }

  onPaginateChange(event: PageEvent) {
    const startIndex = event.pageIndex * event.pageSize;
    this.measurementsTableDataSource.data = this.measurementsDataSource.slice(startIndex, startIndex + event.pageSize);
    this.currentPageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }

  private initMeasurementSeriesOptions(measurementSeriesInfo: Record<string, MeasurementSeriesStart>) {
    this.measurementSeriesOptions = [];
    for (const measurementSeriesId in measurementSeriesInfo) {
      const measurementSeriesStart = measurementSeriesInfo[measurementSeriesId];
      this.measurementSeriesOptions.push({
        measurementName: measurementSeriesStart.name,
        text: `${measurementSeriesId}:
              ${measurementSeriesStart.name}`,
        measurementSeriesId: measurementSeriesId,
      });

    }
    this.measurementSeriesOptions.sort((a: MeasurementSeriesOption, b: MeasurementSeriesOption) => a.measurementName > b.measurementName ? 1 : -1);
  }

  getHardwareInfoName(hardwareId: string) {
    return this.testrunService.getHardwareComponent(hardwareId).name;
  }

  loadMeasurementsComponent() {
    const data = this.dataSource.slice();
    if (!this.selectedSeriesId) {
      this.measurementsDataSource = data;
    } else {
      this.measurementsDataSource = data.filter(
        (m) => m.measurementSeriesId === this.selectedSeriesId
      );
    }

    if (!!this.sort && this.sort.active && !!this.sort.direction) {
      this.measurementsDataSource.sort((a, b) => {
        const isAsc = this.sort.direction === "asc";
        switch (this.sort.active) {
          case "id":
            return compare(a.measurementSeriesId, b.measurementSeriesId, isAsc);
          case "index":
            return compare(a.index, b.index, isAsc);
          case "name":
            return compare(a.name, b.name, isAsc);
          case "validIcon":
            return compare(a.valid, b.valid, isAsc);
          default:
            return 0;
        }
      });
    }
    this.currentPage = 0;
    this.totalDataLength = this.measurementsDataSource.length;
    this.measurementsTableDataSource.data = this.measurementsDataSource.slice(0, this.currentPageSize);
  }

  sortMeasurementsComponent(sort: Sort) {
    this.sort = sort;
    this.loadMeasurementsComponent();
  }

  renderElementRange(element: {
    range?: MeasurementElementRange;
    validValues?: MeasurementElementValidValues;
    validators?: Validator[];
  }): string {
    if (element?.validValues) {
      return JSON.stringify(element.validValues.values);
    }
    if (element?.range) {
      return `${element.range.minimum} - ${element.range.maximum}`;
    }
    if (element?.validators) {
      return this.formatValidatorsRange(element.validators);
    }
    return "";
  }

  formatValidatorsRange(validators: Validator[]) {
    const conditions = [];
    for (const validator of validators) {
      switch (validator.type) {
        case ValidatorType.UNSPECIFIED:
          continue;
        case ValidatorType.EQUAL:
          conditions.push(`= ${validator.value}`);
          continue;
        case ValidatorType.NOT_EQUAL:
          conditions.push(`!= ${validator.value}`);
          continue;
        case ValidatorType.LESS_THAN:
          conditions.push(`< ${validator.value}`);
          continue;
        case ValidatorType.LESS_THAN_OR_EQUAL:
          conditions.push(`<= ${validator.value}`);
          continue;
        case ValidatorType.GREATER_THAN:
          conditions.push(`> ${validator.value}`);
          continue;
        case ValidatorType.GREATER_THAN_OR_EQUAL:
          conditions.push(`>= ${validator.value}`);
          continue;
        case ValidatorType.REGEX_MATCH:
          conditions.push(`[${validator.value}]`);
          continue;
        case ValidatorType.REGEX_NO_MATCH:
          conditions.push(`[^${validator.value}]`);
          continue;
        case ValidatorType.IN_SET:
          conditions.push(`IN ${validator.value}`);
          continue;
        case ValidatorType.NOT_IN_SET:
          conditions.push(`NOT IN ${validator.value}`);
          continue;
      }
    }
    return conditions.join(", ");
  }
}
