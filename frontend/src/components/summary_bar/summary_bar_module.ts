import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatBadgeModule} from '@angular/material/badge';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';

import {TimezoneModule} from '../timezone/timezone_module';

import {SummaryBarComponent} from './summary_bar';

@NgModule({
  imports: [
    CommonModule,
    MatBadgeModule,
    MatChipsModule,
    MatIconModule,
    TimezoneModule,
  ],
  declarations: [SummaryBarComponent],
  exports: [SummaryBarComponent]
})
export class SummaryBarModule {
}
