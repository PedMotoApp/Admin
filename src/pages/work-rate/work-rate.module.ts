import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkRatePage } from './work-rate';
import { Ionic2RatingModule } from "ionic2-rating";
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    WorkRatePage,
  ],
  imports: [
    IonicPageModule.forChild(WorkRatePage),
    Ionic2RatingModule,
    TranslateModule.forChild()
  ],
})
export class WorkRatePageModule {}
