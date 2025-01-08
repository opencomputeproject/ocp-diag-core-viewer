import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {LogsViewComponent} from '../logs/logs_view';
import {TestRunViewComponent} from '../testrun/testrun_view';

const routes: Routes = [
  {path: '', component: TestRunViewComponent},
  {path: 'teststeps', loadChildren: () => import('../teststeps/teststeps_module').then(m => m.TestStepsModule)},
  {path: 'teststeps/:testStepId', loadChildren: () => import('../teststeps/teststep/teststep_module').then(m => m.TestStepModule)},
  {path: 'logs', component: LogsViewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
