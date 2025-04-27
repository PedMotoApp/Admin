import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreditsPage } from './credits';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CreditsPage,
    
  ],
  imports: [    
    IonicPageModule.forChild(CreditsPage),
    TranslateModule.forChild()    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreditsPageModule {}
