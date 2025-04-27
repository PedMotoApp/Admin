import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IfoodOrdersPage } from './ifood-orders';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    IfoodOrdersPage,
  ],
  imports: [
    IonicPageModule.forChild(IfoodOrdersPage),
    IonicSelectableModule
  ],
})
export class IfoodOrdersPageModule {}
