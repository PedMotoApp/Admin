import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarBrandPage } from './car-brand';

@NgModule({
  declarations: [
    CarBrandPage,
  ],
  imports: [
    IonicPageModule.forChild(CarBrandPage),
  ],
})
export class CarBrandPageModule {}
