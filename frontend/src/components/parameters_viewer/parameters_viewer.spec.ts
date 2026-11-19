import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ParametersViewerComponent } from './parameters_viewer';
import { ParametersViewerModule } from './parameters_viewer_module';

describe('ParametersViewer Component', () => {
  let fixture: ComponentFixture<ParametersViewerComponent>;
  let component: ParametersViewerComponent;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ParametersViewerModule,
        NoopAnimationsModule,  // This makes test faster and more stable.
      ],
    });

    fixture = TestBed.createComponent(ParametersViewerComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show "No data available" and disable expansion when empty', async () => {
    component.parameters = {};
    fixture.detectChanges();

    const panel = await loader.getHarness(MatExpansionPanelHarness);
    expect(await panel.getTitle()).toBe('Parameters');
    expect(await panel.isDisabled()).toBeTrue();
    expect(await panel.isExpanded()).toBeFalse();
    expect(fixture.nativeElement.querySelector('#parameters-empty')?.textContent.trim())
      .toBe('No data available');
    expect(fixture.nativeElement.querySelector('#parameters-collapsed-hint')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#parameters-json')).toBeFalsy();
  });

  it('should treat undefined parameters as empty', () => {
    component.parameters = undefined;
    fixture.detectChanges();

    expect(component.hasParameters).toBeFalse();
    expect(fixture.nativeElement.querySelector('#parameters-empty')?.textContent.trim())
      .toBe('No data available');
  });

  it('should collapse by default, toggle hint, and render fields via ngx-json-viewer', async () => {
    component.parameters = {
      foo: 'bar',
      count: 42,
      nested: { a: 1 },
    };
    fixture.detectChanges();

    const panel = await loader.getHarness(MatExpansionPanelHarness);
    expect(await panel.isDisabled()).toBeFalse();
    expect(await panel.isExpanded()).toBeFalse();
    expect(fixture.nativeElement.querySelector('#parameters-collapsed-hint')?.textContent.trim())
      .toBe('Click above gray area to view params');
    expect(fixture.nativeElement.querySelector('#parameters-empty')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('#parameters-json')).toBeFalsy();

    await panel.expand();
    expect(fixture.nativeElement.querySelector('#parameters-collapsed-hint')).toBeFalsy();
    const viewerEl = fixture.nativeElement.querySelector('#parameters-json');
    expect(viewerEl).toBeTruthy();
    expect(viewerEl.textContent).toContain('foo');
    expect(viewerEl.textContent).toContain('"bar"');
    expect(viewerEl.textContent).toContain('count');
    expect(viewerEl.textContent).toContain('42');
    expect(viewerEl.textContent).toContain('nested');

    await panel.collapse();
    expect(fixture.nativeElement.querySelector('#parameters-collapsed-hint')).toBeTruthy();
  });

  it('should support a custom title', async () => {
    component.title = 'Custom Params';
    fixture.detectChanges();

    const panel = await loader.getHarness(MatExpansionPanelHarness);
    expect(await panel.getTitle()).toBe('Custom Params');
  });
});
