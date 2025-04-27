import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreditsManualPage } from './credits-manual';

@NgModule({
  declarations: [
    CreditsManualPage,
  ],
  imports: [
    IonicPageModule.forChild(CreditsManualPage),
  ],
})
export class CreditsManualPageModule {}
