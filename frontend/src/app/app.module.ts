import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { KeyValueTableModule } from '../components/key_value_table/key_value_table_module';
import { LogsModule } from '../logs/logs_module';
import { ResultRecordService } from '../services/result_record_service';
import { SideInfoService } from '../services/side_info_service';
import { TestRunService } from '../services/testrun_service';
import { TestrunModule } from '../testrun/testrun_module';
import { TestStepModule } from '../teststeps/teststep/teststep_module';
import { TestStepsModule } from '../teststeps/teststeps_module';

import { App } from './app';
import { AppRoutingModule } from './app_routing.module';
import { NavbarComponent } from './navbar';
import { SideInfoComponent } from './side_info';

/**
 * The main application module.
 */
@NgModule({
  declarations: [
    App,
    NavbarComponent,
    SideInfoComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    KeyValueTableModule,
    LogsModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    TestrunModule,
    TestStepsModule,
    TestStepModule,
  ],
  providers: [
    ResultRecordService,
    SideInfoService,
    TestRunService,
  ],
  bootstrap: [App],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
