import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { ErrorsTableModule } from '../components/errors_table/errors_table_module';
import { FailuresTableModule } from '../components/failures_table/failures_table_module';
import { KeyValueTableModule } from '../components/key_value_table/key_value_table_module';
import { ParametersViewerModule } from '../components/parameters_viewer/parameters_viewer_module';
import { SessionTitleBarModule } from '../components/session_title_bar/session_title_bar_module';
import { SummaryBarModule } from '../components/summary_bar/summary_bar_module';
import { ToggleJsonViewerModule } from '../components/toggle_json_viewer/toggle_json_viewer_module';

import { HardwareComponentsTableComponent } from './hardware_components';
import { PlatformInfosTableComponent } from './platform_infos';
import { SoftwareInfosTableComponent } from './software_infos';
import { TestRunViewComponent } from './testrun_view';

@NgModule({
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatSortModule,
    MatTableModule,
    ErrorsTableModule,
    FailuresTableModule,
    KeyValueTableModule,
    ParametersViewerModule,
    SessionTitleBarModule,
    SummaryBarModule,
    ToggleJsonViewerModule,
  ],
  declarations: [
    HardwareComponentsTableComponent,
    PlatformInfosTableComponent,
    SoftwareInfosTableComponent,
    TestRunViewComponent,
  ],
  exports: [TestRunViewComponent]
})
export class TestrunModule {
}
