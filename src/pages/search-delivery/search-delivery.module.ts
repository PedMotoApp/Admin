import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchDeliveryPage } from './search-delivery';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SearchDeliveryPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchDeliveryPage),
    TranslateModule.forChild()
  ],
})
export class SearchDeliveryPageModule {}
