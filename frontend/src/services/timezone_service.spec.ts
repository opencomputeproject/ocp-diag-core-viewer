import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { formatTimestamp, TimezoneId, TimezoneService } from './timezone_service';

const STORAGE_KEY = 'meltan-result-viewer.timezone';

describe('formatTimestamp', () => {
  it('formats in UTC with nanosecond precision kept', () => {
    expect(formatTimestamp('2021-11-29T05:52:21.879371116Z', 'utc'))
      .toBe('2021-11-29 05:52:21.879371116 UTC');
  });

  it('formats in MTV standard time (PST)', () => {
    expect(formatTimestamp('2021-11-29T05:52:21.879371116Z', 'mtv'))
      .toBe('2021-11-28 21:52:21.879371116 PST');
  });

  it('formats in MTV daylight saving time (PDT)', () => {
    expect(formatTimestamp('2021-10-12T14:09:43.548601100Z', 'mtv'))
      .toBe('2021-10-12 07:09:43.548601100 PDT');
  });

  it('formats midnight as 00 rather than 24', () => {
    expect(formatTimestamp('2021-10-12T00:00:00Z', 'utc'))
      .toBe('2021-10-12 00:00:00 UTC');
  });

  it('handles non-UTC offsets in input', () => {
    expect(formatTimestamp('2021-10-12T14:09:43.5+08:00', 'utc'))
      .toBe('2021-10-12 06:09:43.5 UTC');
  });

  it('formats in local time', () => {
    const result = formatTimestamp('2021-10-12T14:09:43.548601100Z', 'local');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.548601100 \S+$/);
  });

  it('returns empty string for empty input', () => {
    expect(formatTimestamp('', 'utc')).toBe('');
  });

  it('returns input unchanged if it cannot be parsed', () => {
    expect(formatTimestamp('not a timestamp', 'utc')).toBe('not a timestamp');
  });
});

describe('TimezoneService', () => {
  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('defaults to MTV time', () => {
    const service = TestBed.inject(TimezoneService);
    expect(service.timezone).toBe('mtv');
  });

  it('loads the stored timezone', () => {
    localStorage.setItem(STORAGE_KEY, 'utc');
    const service = TestBed.inject(TimezoneService);
    expect(service.timezone).toBe('utc');
  });

  it('ignores an invalid stored timezone', () => {
    localStorage.setItem(STORAGE_KEY, 'mars');
    const service = TestBed.inject(TimezoneService);
    expect(service.timezone).toBe('mtv');
  });

  it('emits, persists and formats with the new timezone', () => {
    const service = TestBed.inject(TimezoneService);
    const emitted: TimezoneId[] = [];
    service.timezone$.subscribe(tz => emitted.push(tz));

    service.setTimezone('utc');

    expect(emitted).toEqual(['mtv', 'utc']);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('utc');
    expect(service.format('2021-11-29T05:52:21Z')).toBe('2021-11-29 05:52:21 UTC');
  });

  it('ignores invalid timezones', () => {
    const service = TestBed.inject(TimezoneService);
    service.setTimezone('mars' as TimezoneId);
    expect(service.timezone).toBe('mtv');
  });
});
