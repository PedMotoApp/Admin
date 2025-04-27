import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClientsAddPage } from './clients-add';
import { TranslateModule } from '@ngx-translate/core';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    ClientsAddPage,
  ],
  imports: [
    IonicPageModule.forChild(ClientsAddPage),
    IonicSelectableModule,
    TranslateModule.forChild()
  ],
})
export class ClientsAddPageModule {}
