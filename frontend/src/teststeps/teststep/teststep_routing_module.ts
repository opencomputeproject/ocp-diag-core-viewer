import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestStepViewComponent } from './teststep_view';


const routes: Routes = [
  {
    path: '',
    component: TestStepViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestStepRoutingModule { }