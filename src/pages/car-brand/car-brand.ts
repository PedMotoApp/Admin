import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-car-brand',
  templateUrl: 'car-brand.html',
})
export class CarBrandPage {

  services: Observable<any>;  
  
  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public platform: Platform,
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,
    public db: DatabaseProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    
    if(this.dataInfo.isHome)
      this.startInterface()
    else
      this.navCtrl.setRoot('LoginPage') 
  }

  startInterface(){

    this.get()
  }

  get(){
        
    this.services = this.db.getBrands()

    this.services.subscribe(data => {
      this.getCallback(data)
    })
  }

  getCallback(data){
    
    data.forEach(element => {
      console.log(element.payload.val())
    });
  }

  add(){
    this.navCtrl.push('CarBrandAddPage')
  }

  edit(service){    
    let info = service.payload.val()
    info.key = service.payload.key    
    this.navCtrl.push('CarBrandAddPage', {payload: info})
  } 
  
  goBack(){
    this.navCtrl.pop()
  }

  remove(data){

    let self  = this

    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.areYouSure)
    alert.then((result) => {

      if(result){
        if(!this.dataInfo.isTest)
          this.removeContinue(data)
        
        else 
          this.uiUtils.showAlertError(this.dataText.accessDenied)                        
      }    
    })   
  }

  removeContinue(data){


    this.db.removeBrands(data.key)
    .then( () => {
      this.uiUtils.showAlert(this.dataText.success, this.dataText.removeSuccess)
    })
  }

}
