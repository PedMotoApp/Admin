import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkRunHistoryPage } from './work-run-history';

@NgModule({
  declarations: [
    WorkRunHistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkRunHistoryPage),
  ],
})
export class WorkRunHistoryPageModule {}
