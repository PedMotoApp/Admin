import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DocumentationPage } from './documentation';

@NgModule({
  declarations: [
    DocumentationPage,
  ],
  imports: [
    IonicPageModule.forChild(DocumentationPage),
  ],
})
export class DocumentationPageModule {}
