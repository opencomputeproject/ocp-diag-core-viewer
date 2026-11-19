import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { ParametersViewerComponent } from './parameters_viewer';

@NgModule({
  imports: [
    CommonModule,
    MatExpansionModule,
    NgxJsonViewerModule,
  ],
  declarations: [ParametersViewerComponent],
  exports: [ParametersViewerComponent],
})
export class ParametersViewerModule {
}
