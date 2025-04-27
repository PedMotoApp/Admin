import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, Platform } from 'ionic-angular';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DatabaseProvider } from '../../providers/database/database';
import { Observable } from 'rxjs/Observable';
import { DataTextProvider } from '../../providers/data-text/data-text'
import * as moment from 'moment';

@IonicPage()
@Component({
  selector: 'page-regions-add',
  templateUrl: 'regions-add.html',
})
export class RegionsAddPage {

  services: Observable<any>;
  payload: any
  
  key: string = ""
  name: string = ""
  description: string = ""
    
  constructor(public navCtrl: NavController, 
    public uiUtils: UiUtilsProvider,    
    public platform: Platform,
    public dataInfo: DataInfoProvider,
    public actionsheetCtrl: ActionSheetController,    
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
    this.clear()  
    this.loadValues()        
  }

 

  loadValues(){
    this.payload = this.navParams.get('payload')     
    
    if(this.payload){      

      this.key = this.payload.key
      this.name = this.payload.name
      this.description = this.payload.description           
    }    
   
  }

  clear(){
    this.key = ""
    this.name = ""
    this.description = ""    
 }
 
  
  checkValues(){


    return new Promise<void>((resolve, reject) => {



        if(!this.name)
          reject("Favor preencher o nome")

        else if(!this.description)
          reject("Favor preencher a descrição")

      

      resolve()

    })
  }
  
  add(){

    let loading = this.uiUtils.showLoading(this.dataText.pleaseWait)    
    loading.present() 

    this.checkValues()
    .then(() => {


      this.db.addRegion(
        this.name, 
        this.description)

      .then( () => {
        loading.dismiss() 
        this.uiUtils.showAlert(this.dataText.success, this.dataText.addedSuccess).present()
        this.navCtrl.pop()
      })

    })
    .catch((error => {
      loading.dismiss() 
      this.uiUtils.showAlertError(error)
    }))
    
  }
 


}
