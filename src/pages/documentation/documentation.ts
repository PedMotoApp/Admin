import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info';
import { DataTextProvider } from '../../providers/data-text/data-text';

interface UserDocumentation {
  uid: string;
  picId?: string;     // Carteira de Identidade
  picHab?: string;    // Carteira de Habilitação
  picOne?: string;    // Foto 1
  picTwo?: string;    // Renavam
  picThree?: string;  // Antecedentes Criminais
  picFour?: string;   // Comprovante de Residência
  picFive?: string;   // Foto 2
  picSix?: string;    // Foto 3
}

@IonicPage()
@Component({
  selector: 'page-documentation',
  templateUrl: 'documentation.html',
})
export class DocumentationPage {
  userData: UserDocumentation | null = null;
  picOne: string | undefined;   // Carteira de Identidade
  picTwo: string | undefined;   // Carteira de Habilitação
  picThree: string | undefined; // Foto 1
  picFour: string | undefined;  // Renavam
  picFive: string | undefined;  // Antecedentes Criminais
  picSix: string | undefined;   // Comprovante de Residência
  picSeven: string | undefined; // Foto 2
  picEight: string | undefined; // Foto 3

  constructor(
    public navCtrl: NavController, 
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,
    public navParams: NavParams
  ) {}

  ionViewDidLoad() {    
    if (this.dataInfo.isHome) {
      this.startInterface();
    } else {
      this.navCtrl.setRoot('LoginPage');
    }
  }

  startInterface() {
    this.userData = this.navParams.get('info');
    console.log('Dados do profissional:', this.userData);

    if (this.userData) {
      this.picOne = this.userData.picId;     // Carteira de Identidade
      this.picTwo = this.userData.picHab;    // Carteira de Habilitação
      this.picThree = this.userData.picOne;  // Foto 1
      this.picFour = this.userData.picTwo;   // Renavam
      this.picFive = this.userData.picThree; // Antecedentes Criminais
      this.picSix = this.userData.picFour;   // Comprovante de Residência
      this.picSeven = this.userData.picFive; // Foto 2
      this.picEight = this.userData.picSix;  // Foto 3
    }
  }
}