import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';

import { TimezoneService } from '../../services/timezone_service';

/**
 * Formats a RFC 3339 timestamp in the timezone selected in TimezoneService,
 * and re-renders when the selection changes.
 *
 * Example:
 *   {{ record.timestamp | tzDate }}
 */
@Pipe({ name: 'tzDate', pure: false })
export class TzDatePipe implements PipeTransform, OnDestroy {
  private lastInput?: string;
  private lastTimezone?: string;
  private lastOutput = '';
  private readonly subscription: Subscription;

  constructor(
    private readonly timezoneService: TimezoneService,
    changeDetectorRef: ChangeDetectorRef) {
    this.subscription = this.timezoneService.timezone$.subscribe(() => {
      changeDetectorRef.markForCheck();
    });
  }

  transform(timestamp: string | null | undefined): string {
    const input = timestamp ?? '';
    const timezone = this.timezoneService.timezone;
    if (input !== this.lastInput || timezone !== this.lastTimezone) {
      this.lastInput = input;
      this.lastTimezone = timezone;
      this.lastOutput = this.timezoneService.format(input);
    }
    return this.lastOutput;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
