import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClientsPage } from './clients';
import { IonicSelectableModule } from 'ionic-selectable';


@NgModule({
  declarations: [
    ClientsPage,
  ],
  imports: [
    IonicPageModule.forChild(ClientsPage),
    IonicSelectableModule
    
  ],
})
export class ClientsPageModule {}
