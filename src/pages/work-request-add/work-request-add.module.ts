import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkRequestAddPage } from './work-request-add';

@NgModule({
  declarations: [
    WorkRequestAddPage,
  ],
  imports: [
    IonicPageModule.forChild(WorkRequestAddPage),
  ],
})
export class WorkRequestAddPageModule {}
