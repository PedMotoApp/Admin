import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistoryPage } from './history';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    HistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(HistoryPage),
    IonicSelectableModule 
  ],
})
export class HistoryPageModule {}
