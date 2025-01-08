import { Component } from '@angular/core';

import { TestRun, TestRunService } from '../services/testrun_service';
import { BehaviorSubject } from 'rxjs';

/**
 *  The Teststeps view page
 *
 *  Example:
 *  <teststeps-view></teststeps-view>
 */
@Component({
  selector: 'teststeps-view',
  templateUrl: './teststeps_view.ng.html',
  styleUrls: ['./teststeps_view.css']
})
export class TestStepsViewComponent {
  testrun: TestRun;
  private dataReadySubject = new BehaviorSubject<boolean>(false);
  dataReady$ = this.dataReadySubject.asObservable();

  constructor(private readonly testrunService: TestRunService) {
    this.testrun = this.testrunService.get();
    this.testrunService.dataReady$.subscribe(newVal => {
      if (newVal) {
        this.testrun = this.testrunService.get();
        this.dataReadySubject.next(newVal);
      }
    });
  }
}
