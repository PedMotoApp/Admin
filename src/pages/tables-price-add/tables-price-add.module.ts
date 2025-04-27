import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TablesPriceAddPage } from './tables-price-add';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    TablesPriceAddPage,
  ],
  imports: [
    IonicPageModule.forChild(TablesPriceAddPage),
    IonicSelectableModule
  ],
})
export class TablesPriceAddPageModule {}
