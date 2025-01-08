import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TestStepsViewComponent } from './teststeps_view';


const routes: Routes = [
  {
    path: '',
    component: TestStepsViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestStepsRoutingModule { }