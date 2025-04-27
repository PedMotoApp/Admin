import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagersPage } from './managers';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    ManagersPage,
  ],
  imports: [
    IonicPageModule.forChild(ManagersPage),
    IonicSelectableModule
  ],
})
export class ManagersPageModule {}
