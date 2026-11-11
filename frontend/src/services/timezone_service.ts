import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** Identifier of a display timezone option. */
export type TimezoneId = 'local' | 'mtv' | 'utc';

/** A timezone option which can be selected for displaying timestamps. */
export interface TimezoneOption {
  readonly id: TimezoneId;
  /** Short label shown in the selector. */
  readonly label: string;
  /** Longer description shown as tooltip. */
  readonly description: string;
  /**
   * IANA timezone name passed to Intl.DateTimeFormat. `undefined` means the
   * browser's local timezone.
   */
  readonly ianaZone?: string;
}

/** All supported display timezones. */
export const TIMEZONE_OPTIONS: readonly TimezoneOption[] = [
  {
    id: 'local',
    label: 'Local',
    description: 'Browser local time',
    ianaZone: undefined,
  },
  {
    id: 'mtv',
    label: 'MTV',
    description: 'Mountain View time (America/Los_Angeles)',
    ianaZone: 'America/Los_Angeles',
  },
  {
    id: 'utc',
    label: 'UTC',
    description: 'Coordinated Universal Time',
    ianaZone: 'UTC',
  },
];

const DEFAULT_TIMEZONE: TimezoneId = 'mtv';
const STORAGE_KEY = 'meltan-result-viewer.timezone';

function isTimezoneId(value: unknown): value is TimezoneId {
  return TIMEZONE_OPTIONS.some(option => option.id === value);
}

function getOption(id: TimezoneId): TimezoneOption {
  return TIMEZONE_OPTIONS.find(option => option.id === id) ?? TIMEZONE_OPTIONS[0];
}

/**
 * Formats a RFC 3339 timestamp (e.g. `2021-11-29T05:52:21.879371116Z`) as
 * `YYYY-MM-DD HH:mm:ss[.fraction] TZ` in the given timezone.
 *
 * The fractional seconds of the original timestamp are kept as-is (up to
 * nanosecond precision), so the result can be matched against Meltan logs.
 * Returns an empty string for empty input, and the input unchanged if it
 * cannot be parsed.
 */
export function formatTimestamp(timestamp: string, timezone: TimezoneId): string {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return timestamp;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: getOption(timezone).ianaZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  });
  const parts: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value;
  }

  // Keep the original sub-second precision, which Date cannot represent.
  const fractionMatch = /T\d{2}:\d{2}:\d{2}(\.\d+)/.exec(timestamp);
  const fraction = fractionMatch ? fractionMatch[1] : '';

  return `${parts.year}-${parts.month}-${parts.day} ` +
    `${parts.hour}:${parts.minute}:${parts.second}${fraction} ` +
    `${parts.timeZoneName}`;
}

/**
 * Holds the timezone used for displaying timestamps across the viewer. The
 * selection is persisted in localStorage when available.
 */
@Injectable({ providedIn: 'root' })
export class TimezoneService {
  readonly options = TIMEZONE_OPTIONS;
  private readonly timezoneSubject =
    new BehaviorSubject<TimezoneId>(TimezoneService.loadTimezone());
  readonly timezone$ = this.timezoneSubject.asObservable();

  get timezone(): TimezoneId {
    return this.timezoneSubject.value;
  }

  setTimezone(timezone: TimezoneId) {
    if (!isTimezoneId(timezone) || timezone === this.timezone) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, timezone);
    } catch {
      // localStorage may be unavailable (e.g. some file:// contexts).
    }
    this.timezoneSubject.next(timezone);
  }

  /** Formats `timestamp` in the currently selected timezone. */
  format(timestamp: string): string {
    return formatTimestamp(timestamp, this.timezone);
  }

  private static loadTimezone(): TimezoneId {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isTimezoneId(stored)) {
        return stored;
      }
    } catch {
      // localStorage may be unavailable (e.g. some file:// contexts).
    }
    return DEFAULT_TIMEZONE;
  }
}
