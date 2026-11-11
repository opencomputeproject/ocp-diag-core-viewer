import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';

import {TimezoneModule} from '../components/timezone/timezone_module';
import {ToggleJsonViewerModule} from '../components/toggle_json_viewer/toggle_json_viewer_module';

import {LogsViewComponent} from './logs_view';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSelectModule,
    MatTableModule,
    TimezoneModule,
    ToggleJsonViewerModule,
  ],
  declarations: [LogsViewComponent],
  exports: [
    LogsViewComponent,
  ],
})
export class LogsModule {
}
