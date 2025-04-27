import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegionsPage } from './regions';

@NgModule({
  declarations: [
    RegionsPage,
  ],
  imports: [
    IonicPageModule.forChild(RegionsPage),
  ],
})
export class RegionsPageModule {}
