import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IfoodPage } from './ifood';
import { IonicSelectableModule } from 'ionic-selectable';




@NgModule({
  declarations: [
    IfoodPage,
  ],
  imports: [
    IonicPageModule.forChild(IfoodPage),
    IonicSelectableModule
  ],
})
export class IfoodPageModule {}
