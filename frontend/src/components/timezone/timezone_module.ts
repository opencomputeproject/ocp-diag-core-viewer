import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { TimezoneSelectorComponent } from './timezone_selector';
import { TzDatePipe } from './tz_date_pipe';

@NgModule({
  imports: [
    CommonModule,
    MatButtonToggleModule,
  ],
  declarations: [TimezoneSelectorComponent, TzDatePipe],
  exports: [TimezoneSelectorComponent, TzDatePipe],
})
export class TimezoneModule {
}
