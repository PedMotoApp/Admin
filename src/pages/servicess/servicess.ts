import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-servicess',
  templateUrl: 'servicess.html',
})
export class ServicessPage {

  services: Observable<any>;  
  
  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public platform: Platform,
    public dataText: DataTextProvider,  
    public dataInfo: DataInfoProvider,
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
    this.getServices()
  }

  add(){
    this.navCtrl.push('ServicessAddPage')
  }

  edit(service){    
    let info = service.payload.val()
    info.key = service.payload.key    
    this.navCtrl.push('ServicessAddPage', {payload: info})
  }

  getServices(){
    
    this.services = this.db.getAllServices()

    this.services.subscribe(data => {
      this.getServicesCallback(data)
    })
  }

  getServicesCallback(data){
    
    data.forEach(element => {
      console.log(element.payload.val())
    });
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

    this.db.removeService(data.key)
    .then( () => {
      this.uiUtils.showAlert(this.dataText.success, this.dataText.removeSuccess)
    })
  }

}
