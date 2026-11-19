import { Component, Input, ViewEncapsulation } from '@angular/core';

/**
 * Collapsible section that renders parameters using ngx-json-viewer.
 *
 * Example:
 *   <parameters-viewer [parameters]="testrun.parameters"></parameters-viewer>
 */
@Component({
  selector: 'parameters-viewer',
  templateUrl: './parameters_viewer.ng.html',
  styleUrls: ['./parameters_viewer.css'],
  // Needed to style the inner elements of mat-expansion-panel.
  encapsulation: ViewEncapsulation.None,
})
export class ParametersViewerComponent {
  @Input() title = 'Parameters';
  @Input() depth = 2;

  expanded = false;
  hasParameters = false;
  private params: object = {};

  @Input()
  get parameters(): object {
    return this.params;
  }
  set parameters(value: object | undefined | null) {
    this.params = value ?? {};
    this.hasParameters = Object.keys(this.params).length > 0;
    if (!this.hasParameters) {
      this.expanded = false;
    }
  }
}
