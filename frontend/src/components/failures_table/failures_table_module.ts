import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';

import { FailuresTableComponent } from './failures_table';

@NgModule({
  imports: [
    CommonModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    RouterModule,
  ],
  declarations: [FailuresTableComponent],
  exports: [FailuresTableComponent],
})
export class FailuresTableModule {
}
