import { TestBed } from '@angular/core/testing';

import { ResultRecord, ResultRecordService } from './result_record_service';
import { SEVERITIES } from './results_type';

// OCP_DIAG_RESULT_RECORDS is from OCP_DIAG_RESULT_RECORDS.js.
declare let OCP_DIAG_RESULT_RECORDS: ResultRecord[] | undefined;

describe('ResultRecords Service', () => {
  let service: ResultRecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResultRecordService,
      ],
    });
    service = TestBed.inject(ResultRecordService);
  });

  it('should be instantiated', () => {
    expect(service).toBeTruthy();
  });

  it('should have initialized dataReady observable', () => {
    expect(service.dataReady$).toBeDefined();
  });

  it('get default empty records', () => {
    OCP_DIAG_RESULT_RECORDS = [];
    expect(service.get()).toEqual([]);
  });

  it('get records from service', () => {
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
    OCP_DIAG_RESULT_RECORDS = meltanRecords;
    expect(service.get()).toEqual(meltanRecords);
  });

  it('filter records by severity', () => {
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
    OCP_DIAG_RESULT_RECORDS = meltanRecords;

    expect(service.get('TRACE').length).toEqual(6);
    expect(service.get('DEBUG').length).toEqual(5);
    expect(service.get('INFO').length).toEqual(4);
    expect(service.get('WARNING').length).toEqual(3);
    expect(service.get('ERROR').length).toEqual(2);
    expect(service.get('FATAL').length).toEqual(1);
  });

  it('Search records by keyword', () => {
    const meltanRecords: ResultRecord[] = [
      {
        sequenceNumber: 0,
        category: 'Log',
        message: 'I have a pen.',
        severity: 'DEBUG',
        stage: 'Run',
        timestamp: '2021-10-12T14:09:43.546167417Z',
        raw: {
          sequenceNumber: 0,
          timestamp: '2021-10-12T14:09:43.546167417Z',
        },
      },
      {
        sequenceNumber: 1,
        category: 'Error',
        message: 'I have a book.',
        severity: 'ERROR',
        stage: 'Step 1',
        timestamp: '2021-10-12T14:09:43.546167417Z',
        raw: {
          sequenceNumber: 1,
          timestamp: '2021-10-12T14:09:43.546167417Z',
        },
      },
    ];
    OCP_DIAG_RESULT_RECORDS = meltanRecords;

    expect(service.get('TRACE').length).toEqual(2);
    expect(service.get('TRACE', '').length).toEqual(2);
    // Search for the stage.
    expect(service.get('TRACE', 'Run').length).toEqual(1);
    // Search for the catagory.
    expect(service.get('TRACE', 'Log').length).toEqual(1);
    // Search for the message.
    expect(service.get('TRACE', 'have').length).toEqual(2);
    expect(service.get('TRACE', 'book').length).toEqual(1);
    expect(service.get('TRACE', 'eraser').length).toEqual(0);
  });
});
