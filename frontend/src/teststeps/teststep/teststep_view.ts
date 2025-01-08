import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Measurement, TestRunService, TestStep } from '../../services/testrun_service';
import { BehaviorSubject } from 'rxjs';

/**
 *  The Teststep view page
 *
 *  Example:
 *  <teststeps-teststep-view></teststeps-teststep-view>
 */
@Component({
  selector: 'teststeps-teststep-view',
  templateUrl: 'teststep_view.ng.html',
  styleUrls: ['teststep_view.css']
})
export class TestStepViewComponent implements OnInit {
  testStepId = '';
  testStep?: TestStep;
  private dataReadySubject = new BehaviorSubject<boolean>(false);
  dataReady$ = this.dataReadySubject.asObservable();
  measurementsDataSource: Measurement[] = [];
  measurementSeriesDataSource: Measurement[] = [];
  errorsCount = 0;
  diagnosesFailCount = 0;
  measuremntsInvalidCount = 0;
  measurementSeriesInvalidCount = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly testrunService: TestRunService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('testStepId');
    if (id != null) {
      this.testStepId = id;
      this.testrunService.dataReady$.subscribe(newVal => {
        if (newVal) {
          this.dataReadySubject.next(newVal);
          const testStep = this.testrunService.getTestStep(this.testStepId);
          this.testStep = testStep;
          this.measurementsDataSource = testStep.measurements.slice();
          this.measurementSeriesDataSource =
            testStep.measurementSeriesElements.slice();

          this.errorsCount = testStep.errors.length;
          this.diagnosesFailCount =
            testStep.diagnoses.filter(n => n.type === 'FAIL').length;
          this.measuremntsInvalidCount =
            testStep.measurements.filter(n => !n.valid).length;
          this.measurementSeriesInvalidCount =
            testStep.measurementSeriesElements.filter(n => !n.valid).length;
        }
      });
    }
  }
}
