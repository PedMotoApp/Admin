import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegionsAddPage } from './regions-add';

@NgModule({
  declarations: [
    RegionsAddPage,
  ],
  imports: [
    IonicPageModule.forChild(RegionsAddPage),
  ],
})
export class RegionsAddPageModule {}
