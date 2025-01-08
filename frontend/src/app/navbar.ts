import { Component, Injectable, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ResultRecordService } from 'src/services/result_record_service';

/**
 *  The navigation bar of main page
 *
 *  Example:
 *  <app-navbar></app-navbar>
 */
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.ng.html',
  styleUrls: ['./navbar.css']
})

export class NavbarComponent implements OnInit {
  private dataReadySubject = new BehaviorSubject<boolean>(false);
  dataReady$ = this.dataReadySubject.asObservable();
  constructor(private readonly resultRecordService: ResultRecordService) {
    this.resultRecordService.dataReady$.subscribe(newVal => {
      if (newVal) {
        this.dataReadySubject.next(newVal);
      }
    });
  }
  ngOnInit() {
    // do nothing
  }
}
