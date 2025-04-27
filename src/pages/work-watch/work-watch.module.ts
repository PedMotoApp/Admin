import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkWatchPage } from './work-watch';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    WorkWatchPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkWatchPage),
    IonicSelectableModule
  ],
})
export class WorkWatchPageModule {}
