import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarBrandAddPage } from './car-brand-add';

@NgModule({
  declarations: [
    CarBrandAddPage,
  ],
  imports: [
    IonicPageModule.forChild(CarBrandAddPage),
  ],
})
export class CarBrandAddPageModule {}
