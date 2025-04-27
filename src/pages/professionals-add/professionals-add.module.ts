import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfessionalsAddPage } from './professionals-add';
import { TranslateModule } from '@ngx-translate/core';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    ProfessionalsAddPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfessionalsAddPage),
    TranslateModule.forChild(),
    IonicSelectableModule
  ],
})
export class ProfessionalsAddPageModule {}
