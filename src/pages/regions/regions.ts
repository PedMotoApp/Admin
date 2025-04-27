import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'


@IonicPage()
@Component({
  selector: 'page-regions',
  templateUrl: 'regions.html',
})
export class RegionsPage {

  
  services: Observable<any>;  
  payload: any
  
  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public platform: Platform,
    public dataInfo: DataInfoProvider,
    public db: DatabaseProvider,
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

    let payload = this.navParams.get('payload')

    if(payload)
      this.loadPayload(payload)
    
    this.getServices()
  }

  loadPayload(payload){
    console.log(payload)
    this.payload = payload
  }

  select(service){

    let alert = this.uiUtils.showConfirm(this.dataText.warning, this.dataText.areYouSure)  
    alert.then((result) => {
  
      if(result)  
        this.selectContinue(service)
    }) 

  }


  selectContinue(service){
    
    console.log(service.payload.val().name)

    this.db.updateManagerRegion(this.payload.uid, service.payload.val().name)

    .then(() => {
      this.uiUtils.showAlertSuccess(this.dataText.regionAdded)
      this.navCtrl.pop()
    })
    .catch(() => {
      this.uiUtils.showAlertError(this.dataText.errorRegion)
    })

  }

  add(){
    this.navCtrl.push('RegionsAddPage')
  }  

  getServices(){
    
    this.services = this.db.getRegions()

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
        
    this.db.removeRegion(data.key)
    .then( () => {
      this.uiUtils.showAlert(this.dataText.success, this.dataText.removeSuccess)
    })
  }

}
