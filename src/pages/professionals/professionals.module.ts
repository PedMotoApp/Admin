import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfessionalsPage } from './professionals';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    ProfessionalsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfessionalsPage),
    IonicSelectableModule
  ],
})
export class ProfessionalsPageModule {}
