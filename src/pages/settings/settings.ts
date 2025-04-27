import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DataInfoProvider } from '../../providers/data-info/data-info'
import { DataTextProvider } from '../../providers/data-text/data-text'
import { DatabaseProvider } from '../../providers/database/database';
import { UiUtilsProvider } from '../../providers/ui-utils/ui-utils'


@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  payload: any

  constructor(

    public navCtrl: NavController, 
    public dataInfo: DataInfoProvider,
    public dataText: DataTextProvider,
    public db: DatabaseProvider,
    public uiUtils: UiUtilsProvider,
    public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
      
    if(this.dataInfo.isHome)
      this.startInterface()    
    else
      this.navCtrl.setRoot('LoginPage')  
       
  }


  startInterface(){
    this.payload = this.dataInfo.appConfig
  }

  save(){

    this.saveCheck()
    .then(() => {

      let alert = this.uiUtils.showConfirm(this.dataText.warning, "Tem certeza?")  
      alert.then((result) => {
  
        if(result){              
          this.update()    
        }
          
          
      })   
      .catch((error) => {
        this.uiUtils.showAlertError(error)
      })
    })
  }

  saveCheck(){

    return new Promise<void>((resolve, reject) => {
    
    
    resolve()

    })    
  }


  update() {
    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait);
    loading.present();
  
    // Iterate through the properties of this.dataInfo.appConfig
    for (const key in this.dataInfo.appConfig) {
      if (this.dataInfo.appConfig.hasOwnProperty(key)) {
        const value = this.dataInfo.appConfig[key];
  
        // Check the data type and convert as needed
        if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
          // Convert 'true' or 'false' strings to booleans
          this.dataInfo.appConfig[key] = value.toLowerCase() === 'true';
        } else if (!isNaN(value)) {
          // Convert numbers (if it's a valid number)
          this.dataInfo.appConfig[key] = +value; // Using + to convert to a number
        }
        // Add more checks for other data types as needed
      }
    }
  
    this.db.updateSetting(this.dataInfo.appConfig.key, this.dataInfo.appConfig)
      .then(() => {
        loading.dismiss();
        this.uiUtils.showAlertSuccess("Configurações atualizadas com sucesso");
      })
      .catch(() => {
        loading.dismiss();
        this.uiUtils.showAlertError("Erro ao atualizar configurações");
      });
  }
  


  add(){



    this.saveCheck()
    .then(() => {

      let alert = this.uiUtils.showConfirm(this.dataText.warning, "Tem certeza?")  
      alert.then((result) => {
  
        if(result){              
          this.addContinue()    
        }
          
          
      })   
      .catch((error) => {
        this.uiUtils.showAlertError(error)
      })
    })

  }


  addContinue(){

    let loading = this.uiUtils.showLoading(this.dataInfo.pleaseWait)
    loading.present()

    this.db.addSetting(this.dataInfo.appConfig)
    .then(() => {

      loading.dismiss()
      this.uiUtils.showAlertSuccess("Configurações adicionadas com sucesso")

    })
    .catch(() => {

      loading.dismiss()
      this.uiUtils.showAlertError("Erro ao atualizar configurações")

    })

  }

  

}
