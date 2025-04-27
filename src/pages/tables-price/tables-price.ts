import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'

@IonicPage()
@Component({
  selector: 'page-tables-price',
  templateUrl: 'tables-price.html',
})
export class TablesPricePage {

  services: Observable<any>;  
  tablesArray = []
  
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
    this.navCtrl.push('TablesPriceAddPage')
  }

  edit(service){  
    this.navCtrl.push('TablesPriceAddPage', {payload: service})
  }

  getServices(){
    
    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present() 


    this.services = this.db.getAllTablesPrice()

    this.services.subscribe(data => {
      this.getServicesCallback(data)
      loading.dismiss() 
    })
    
  }

  getServicesCallback(data){    

    this.tablesArray = []
    
    data.forEach(element => {
      let info = element.payload.val()
      info.key = element.payload.key

      if(this.dataInfo.userInfo.isAdmin){
        this.tablesArray.push(info)
      }
      else {

        if(info.regiao === this.dataInfo.userInfo.managerRegion){
          this.tablesArray.push(info)
        }
      }
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
        
    this.db.removeTablesPrice(data.key)
    .then( () => {
      this.uiUtils.showAlert(this.dataText.success, this.dataText.removeSuccess)
    })
  }

}
