import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

import { TimezoneId, TimezoneService } from '../../services/timezone_service';

/**
 * A toggle for choosing the timezone in which timestamps are displayed.
 *
 * Example:
 *   <timezone-selector></timezone-selector>
 */
@Component({
  selector: 'timezone-selector',
  templateUrl: './timezone_selector.ng.html',
  styleUrls: ['./timezone_selector.css'],
  // Needed to style the inner elements of mat-button-toggle.
  encapsulation: ViewEncapsulation.None,
})
export class TimezoneSelectorComponent {
  constructor(readonly timezoneService: TimezoneService) {}

  onChange(event: MatButtonToggleChange) {
    this.timezoneService.setTimezone(event.value as TimezoneId);
  }
}
