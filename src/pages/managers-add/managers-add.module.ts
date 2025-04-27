import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManagersAddPage } from './managers-add';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    ManagersAddPage,
  ],
  imports: [
    IonicPageModule.forChild(ManagersAddPage),
    TranslateModule.forChild()

  ],
})
export class ManagersAddPageModule {}
