import { Injectable } from '@angular/core';

import { OutputArtifact, SEVERITIES, Severity } from './results_type';

/** The category list of meltan result records. */
export const CATEGORIES = [
  'Start', 'End', 'Log', 'Error', 'Tag', 'File', 'Extention', 'Diagnosis',
  'Measurement', 'Measurement Series'
] as const;

/** ResultRecord represents a single meltan result record. */
export declare interface ResultRecord {
  /** The sequence number of this record. */
  sequenceNumber: number;
  /**
   * The timestamp of this record.
   * @example
   * "2021-10-12T14:09:43.548764032Z"
   */
  timestamp: string;
  /** The severity of this record. */
  severity: Severity;
  /** "Step {n}" is for teststep {n}, and "Run" is for testrun. */
  stage: string;
  /** The category of this record. */
  category: (typeof CATEGORIES)[number];
  /** The summary message of this record. */
  message: string;
  /** Source of the message. */
  sourceLocation?: string | null | undefined;
  /** Actual file linked from source location */
  sourceLocationLink?: string | null | undefined;
  /** The original raw record. */
  raw: OutputArtifact;
}

// OCP_DIAG_RESULT_RECORDS is from OCP_DIAG_RESULT_RECORDS.js.
declare let OCP_DIAG_RESULT_RECORDS: ResultRecord[] | undefined;
/** A service that provides the meltan result records. */
@Injectable()
export class ResultRecordService {
  /**
   * Gets result records.
   * @param severityFilter Returns records have higher or equal severity with
   * serverityFilter. Default to 'TRACE'.
   * @param searchKeyword Returns records contain searchKeyword in it's stage,
   * category or message.
   * @return The meltan result records.
   */
  get(severityFilter: Severity = 'TRACE',
    searchKeyword = ''): ResultRecord[] {
    if (OCP_DIAG_RESULT_RECORDS == null) {
      return [];
    }
    const data: ResultRecord[] = [];
    for (const record of (OCP_DIAG_RESULT_RECORDS as ResultRecord[])) {
      // Filter by severity.
      const filterLevel = SEVERITIES.findIndex(n => n === severityFilter);
      const recordLevel = SEVERITIES.findIndex(n => n === record.severity);
      if (recordLevel < filterLevel) {
        continue;
      }
      // Filter by search keyword.
      if (searchKeyword.length === 0 || record.stage.includes(searchKeyword) ||
        record.category.includes(searchKeyword) ||
        record.message.includes(searchKeyword)) {
        data.push(record);
      }
    }
    return data;
  }
}
