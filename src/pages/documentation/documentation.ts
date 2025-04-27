import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-documentation',
  templateUrl: 'documentation.html',
})
export class DocumentationPage {

  userData: any
  picOne: string;
  picTwo: string;
  picThree: string;
  picFour: string;
  picFive: string;
  picSix: string;
  picSeven: string;
  picHeight: string;

  constructor(public navCtrl: NavController, 
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {    

    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')          
  }

  startInterface(){

    this.userData = this.navParams.get('info')
    
    console.log(this.userData)

    this.picOne = this.userData.picHab
    this.picTwo = this.userData.picId
    this.picThree = this.userData.picOne
    this.picFour = this.userData.picTwo
    this.picFive = this.userData.picThree
    this.picSix = this.userData.picFour
    this.picSeven = this.userData.picFive
    this.picHeight = this.userData.picSix
  }

}
