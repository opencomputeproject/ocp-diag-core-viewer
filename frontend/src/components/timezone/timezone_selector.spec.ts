import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TimezoneService } from '../../services/timezone_service';

import { TimezoneModule } from './timezone_module';

const STORAGE_KEY = 'meltan-result-viewer.timezone';

@Component({
  template: `
    <timezone-selector></timezone-selector>
    <span id="time">{{ timestamp | tzDate }}</span>
  `,
})
class TestHostComponent {
  timestamp = '2021-11-29T05:52:21.879371116Z';
}

describe('TimezoneSelector and tzDate pipe', () => {
  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    localStorage.setItem(STORAGE_KEY, 'utc');
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [TimezoneModule, NoopAnimationsModule],
    });
  });

  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('renders one toggle per timezone option', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const labels = fixture.debugElement.queryAll(By.css('mat-button-toggle'))
      .map(el => el.nativeElement.textContent.trim());
    expect(labels).toEqual(['Local', 'MTV', 'UTC']);
  });

  it('formats with the selected timezone', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#time').textContent)
      .toBe('2021-11-29 05:52:21.879371116 UTC');
  });

  it('re-renders when a toggle is clicked', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const mtvButton = fixture.debugElement
      .queryAll(By.css('mat-button-toggle button'))
      .find(el => el.nativeElement.textContent.trim() === 'MTV');
    expect(mtvButton).toBeTruthy();
    mtvButton?.nativeElement.click();
    fixture.detectChanges();

    expect(TestBed.inject(TimezoneService).timezone).toBe('mtv');
    expect(fixture.nativeElement.querySelector('#time').textContent)
      .toBe('2021-11-28 21:52:21.879371116 PST');
  });
});
