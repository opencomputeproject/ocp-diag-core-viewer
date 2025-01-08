import { TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { App } from './app';
import { AppModule } from './app.module';

describe('App Component', () => {
  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach((() => {
    TestBed.configureTestingModule({
      imports: [
        AppModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
        RouterTestingModule,
      ],
    });
  }));

  it('should create the app', () => {
    const comp = TestBed.createComponent(App);
    expect(comp).toBeTruthy();
  });
});
